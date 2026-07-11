import { readSheetTab } from "@/lib/gviz";

export type FinancialReportRow = {
  Added?: string;
  Salon?: string;
  "Report type"?: string;
  Date?: string;
  Client?: string;
  Service?: string;
  Provider?: string;
  "Gross sales"?: string;
  Discounts?: string;
  Tips?: string;
  Tax?: string;
  Fees?: string;
  "Net sales"?: string;
  "Payment type"?: string;
  Source?: string;
  Raw?: string;
};

export type FinancialSummary = {
  rows: FinancialReportRow[];
  rowCount: number;
  grossSales: number;
  netSales: number;
  tips: number;
  tax: number;
  fees: number;
  discounts: number;
  reportTypes: { name: string; count: number; grossSales: number; netSales: number }[];
  recentRows: FinancialReportRow[];
};

const GROSS_KEYS = [
  "Gross sales",
  "Gross Sales",
  "Gross",
  "Sales",
  "Total Sales",
  "Total",
  "Amount",
  "Amount Paid",
  "Paid",
  "Price",
  "Subtotal",
  "Service Sales",
  "Product Sales",
  "Charge",
  "Payment Amount",
  "Grand Total",
];

const NET_KEYS = [
  "Net sales",
  "Net Sales",
  "Net",
  "Net Amount",
  "Net Revenue",
  "Collected",
  "Total Collected",
  "Deposit",
  "Payout",
  "Paid",
  "Amount Paid",
  "Payments",
  "Payment Amount",
];

const TIP_KEYS = ["Tips", "Tip", "Gratuity", "Total Tips"];
const TAX_KEYS = ["Tax", "Taxes", "Sales Tax", "Total Tax"];
const FEE_KEYS = ["Fees", "Processing Fee", "Credit Card Fee", "Card Fee", "Stripe Fee", "Processor Fee"];
const DISCOUNT_KEYS = ["Discounts", "Discount", "Promo", "Promotions", "Coupon", "Coupons"];
const DATE_KEYS = ["Date", "Transaction Date", "Close Date", "Checkout Date", "Appointment Date", "Payment Date"];
const CLIENT_KEYS = ["Client", "Client Name", "Customer", "Customer Name", "Name"];
const SERVICE_KEYS = ["Service", "Service Name", "Item", "Item Name", "Description", "Product", "Class"];
const PROVIDER_KEYS = ["Provider", "Service Provider", "Employee", "Staff", "Team Member", "Artist"];

export function reportSlug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function titleFromReportSlug(slug: string) {
  return slug.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

export function moneyValue(value?: string) {
  const raw = String(value || "").trim();
  const negative = /^\(.*\)$/.test(raw);
  const cleaned = raw.replace(/[^0-9.-]/g, "");
  const parsed = Number(cleaned);
  if (!Number.isFinite(parsed)) return 0;
  return negative ? -Math.abs(parsed) : parsed;
}

export function money(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export async function getFinancialReportRows() {
  const rows = await readSheetTab("FinancialReports").catch(() => []);
  return rows as FinancialReportRow[];
}

function parseRaw(row: FinancialReportRow) {
  if (!row.Raw) return {};
  try {
    const parsed = JSON.parse(row.Raw) as Record<string, string>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function keyFor(label: string) {
  return label.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function rawValue(row: FinancialReportRow, labels: string[]) {
  const raw = parseRaw(row);
  const wanted = new Set(labels.map(keyFor));
  const match = Object.entries(raw).find(([key, value]) => wanted.has(keyFor(key)) && String(value || "").trim());
  return match ? String(match[1] || "").trim() : "";
}

export function reportTextValue(row: FinancialReportRow, primary: keyof FinancialReportRow, rawLabels: string[]) {
  return String(row[primary] || "").trim() || rawValue(row, rawLabels);
}

export function reportMoneyValue(row: FinancialReportRow, primary: keyof FinancialReportRow, rawLabels: string[]) {
  return moneyValue(String(row[primary] || "").trim() || rawValue(row, rawLabels));
}

export function reportGrossValue(row: FinancialReportRow) {
  return reportMoneyValue(row, "Gross sales", GROSS_KEYS);
}

export function reportNetValue(row: FinancialReportRow) {
  const net = reportMoneyValue(row, "Net sales", NET_KEYS);
  return net || reportGrossValue(row);
}

export function reportDisplay(row: FinancialReportRow) {
  return {
    date: reportTextValue(row, "Date", DATE_KEYS),
    client: reportTextValue(row, "Client", CLIENT_KEYS),
    service: reportTextValue(row, "Service", SERVICE_KEYS),
    provider: reportTextValue(row, "Provider", PROVIDER_KEYS),
    gross: reportTextValue(row, "Gross sales", GROSS_KEYS),
    net: reportTextValue(row, "Net sales", NET_KEYS),
  };
}

export function summarizeFinancialRows(rows: FinancialReportRow[]): FinancialSummary {
  const byType = new Map<string, { name: string; count: number; grossSales: number; netSales: number }>();
  let grossSales = 0;
  let netSales = 0;
  let tips = 0;
  let tax = 0;
  let fees = 0;
  let discounts = 0;

  rows.forEach((row) => {
    const type = row["Report type"] || "Financial report";
    const gross = reportGrossValue(row);
    const net = reportNetValue(row);
    grossSales += gross;
    netSales += net;
    tips += reportMoneyValue(row, "Tips", TIP_KEYS);
    tax += reportMoneyValue(row, "Tax", TAX_KEYS);
    fees += reportMoneyValue(row, "Fees", FEE_KEYS);
    discounts += reportMoneyValue(row, "Discounts", DISCOUNT_KEYS);

    const existing = byType.get(type) || { name: type, count: 0, grossSales: 0, netSales: 0 };
    existing.count += 1;
    existing.grossSales += gross;
    existing.netSales += net;
    byType.set(type, existing);
  });

  const recentRows = [...rows]
    .sort((a, b) => String(reportDisplay(b).date || b.Added || "").localeCompare(String(reportDisplay(a).date || a.Added || "")))
    .slice(0, 12);

  return {
    rows,
    rowCount: rows.length,
    grossSales,
    netSales,
    tips,
    tax,
    fees,
    discounts,
    reportTypes: [...byType.values()].sort((a, b) => b.count - a.count),
    recentRows,
  };
}

export function rowsForReportSlug(rows: FinancialReportRow[], slug: string) {
  const matchTitle = titleFromReportSlug(slug).toLowerCase();
  return rows.filter((row) => {
    const rowType = String(row["Report type"] || "").toLowerCase();
    return reportSlug(rowType) === slug || rowType === matchTitle || slug.includes(reportSlug(rowType));
  });
}

export function financialContextForAssistant(summary: FinancialSummary) {
  if (summary.rowCount === 0) {
    return "No imported FinancialReports rows are available yet. Ask the owner to import reports before making data-specific claims.";
  }

  const typeLines = summary.reportTypes.slice(0, 8).map((type) => (
    `- ${type.name}: ${type.count} rows, gross ${money(type.grossSales)}, net ${money(type.netSales)}`
  ));
  const recentLines = summary.recentRows.slice(0, 8).map((row) => (
    (() => {
      const display = reportDisplay(row);
      return `- ${display.date || row.Added || "No date"} | ${display.client || "No client"} | ${display.service || row["Report type"] || "Report row"} | gross ${display.gross || "$0"} | net ${display.net || "$0"}`;
    })()
  ));

  return [
    "Imported FinancialReports summary:",
    `Rows: ${summary.rowCount}`,
    `Gross sales total: ${money(summary.grossSales)}`,
    `Net sales total: ${money(summary.netSales)}`,
    `Tips total: ${money(summary.tips)}`,
    `Taxes total: ${money(summary.tax)}`,
    `Fees total: ${money(summary.fees)}`,
    `Discounts total: ${money(summary.discounts)}`,
    "Report types:",
    ...typeLines,
    "Recent imported rows:",
    ...recentLines,
  ].join("\n");
}
