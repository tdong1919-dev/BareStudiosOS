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

export function reportSlug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function titleFromReportSlug(slug: string) {
  return slug.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

export function moneyValue(value?: string) {
  const cleaned = String(value || "").replace(/[^0-9.-]/g, "");
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function money(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export async function getFinancialReportRows() {
  const rows = await readSheetTab("FinancialReports").catch(() => []);
  return rows as FinancialReportRow[];
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
    const gross = moneyValue(row["Gross sales"]);
    const net = moneyValue(row["Net sales"]);
    grossSales += gross;
    netSales += net;
    tips += moneyValue(row.Tips);
    tax += moneyValue(row.Tax);
    fees += moneyValue(row.Fees);
    discounts += moneyValue(row.Discounts);

    const existing = byType.get(type) || { name: type, count: 0, grossSales: 0, netSales: 0 };
    existing.count += 1;
    existing.grossSales += gross;
    existing.netSales += net;
    byType.set(type, existing);
  });

  const recentRows = [...rows]
    .sort((a, b) => String(b.Date || b.Added || "").localeCompare(String(a.Date || a.Added || "")))
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
    `- ${row.Date || row.Added || "No date"} | ${row.Client || "No client"} | ${row.Service || row["Report type"] || "Report row"} | gross ${row["Gross sales"] || "$0"} | net ${row["Net sales"] || "$0"}`
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
