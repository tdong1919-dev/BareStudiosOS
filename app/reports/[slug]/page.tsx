import type { Metadata } from "next";
import PageShell from "@/components/marketing/PageShell";
import { requireSession } from "@/lib/auth";
import {
  getFinancialReportRows,
  money,
  reportDisplay,
  reportGrossValue,
  reportNetValue,
  rowsForReportSlug,
  summarizeFinancialRows,
  titleFromReportSlug,
} from "@/lib/financial-reports";

export const metadata: Metadata = { title: "Report Detail - Bare Studios OS" };

function csvHref(rows: string[][]) {
  const csv = rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(",")).join("\n");
  return `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
}

function SalesReportFilters() {
  const inputClass = "rounded-md border border-border bg-white px-3 py-2.5 text-sm text-text-primary outline-none focus:border-text-primary";

  return (
    <section className="mb-6 rounded-xl border border-border bg-surface p-5">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted">Filters</p>
          <h2 className="mt-1 font-serif text-2xl">Refine sales data</h2>
        </div>
        <button type="button" className="rounded-md border border-border bg-white px-4 py-2 text-sm font-medium hover:bg-surface-elevated">
          Apply filters
        </button>
      </div>
      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <label className="grid gap-1 text-xs uppercase tracking-[0.12em] text-text-muted">
          From
          <input className={inputClass} type="date" defaultValue="2026-07-01" />
        </label>
        <label className="grid gap-1 text-xs uppercase tracking-[0.12em] text-text-muted">
          To
          <input className={inputClass} type="date" defaultValue="2026-07-31" />
        </label>
        <label className="grid gap-1 text-xs uppercase tracking-[0.12em] text-text-muted">
          Service
          <select className={inputClass} defaultValue="All services">
            {["All services", "Barbering", "Signature facial", "Classic lash fill", "Brow sculpt", "Product sale"].map((option) => <option key={option}>{option}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-xs uppercase tracking-[0.12em] text-text-muted">
          Location
          <select className={inputClass} defaultValue="Bare Studios">
            {["Bare Studios", "All locations"].map((option) => <option key={option}>{option}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-xs uppercase tracking-[0.12em] text-text-muted">
          Employee
          <select className={inputClass} defaultValue="All employees">
            {["All employees", "Ciara", "Na", "Andy", "Cindy"].map((option) => <option key={option}>{option}</option>)}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className="grid gap-1 text-xs uppercase tracking-[0.12em] text-text-muted">
            Min
            <input className={inputClass} type="number" min="0" placeholder="$0" />
          </label>
          <label className="grid gap-1 text-xs uppercase tracking-[0.12em] text-text-muted">
            Max
            <input className={inputClass} type="number" min="0" placeholder="$500" />
          </label>
        </div>
      </div>
    </section>
  );
}

function SalesTrendsGraph() {
  const points = [
    ["Week 1", 8420],
    ["Week 2", 9680],
    ["Week 3", 11150],
    ["Week 4", 10480],
  ] as const;
  const max = Math.max(...points.map(([, value]) => value));

  return (
    <section className="mb-6 rounded-xl border border-border bg-white p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted">Sales trends</p>
          <h2 className="mt-1 font-serif text-2xl">Filtered revenue by week</h2>
        </div>
        <p className="text-sm text-text-secondary">Demo graph updates from selected filters.</p>
      </div>
      <div className="mt-6 grid h-72 grid-cols-4 items-end gap-4 border-b border-l border-border px-4 pb-4">
        {points.map(([label, value]) => (
          <div key={label} className="flex h-full flex-col justify-end gap-2">
            <div className="rounded-t-md bg-[#30302f]" style={{ height: `${Math.max((value / max) * 100, 8)}%` }} />
            <div className="text-center">
              <p className="text-xs font-medium">{money(value)}</p>
              <p className="text-[11px] uppercase tracking-[0.12em] text-text-muted">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default async function ReportDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  await requireSession();
  const { slug } = await params;
  const title = titleFromReportSlug(slug);
  const allFinancialRows = await getFinancialReportRows();
  const matchingRows = rowsForReportSlug(allFinancialRows, slug);
  const activeRows = matchingRows.length > 0 ? matchingRows : allFinancialRows;
  const summary = summarizeFinancialRows(activeRows);
  const hasImportedData = summary.rowCount > 0;
  const isSalesReport = slug.startsWith("sales-");
  const isSalesTrends = slug === "sales-trends";
  const reportRows = hasImportedData
    ? [
        ["Report type", "Date", "Client", "Service", "Provider", "Gross sales", "Net sales", "Payment type"],
        ...activeRows.map((row) => [
          row["Report type"] || title,
          reportDisplay(row).date || "",
          reportDisplay(row).client || "",
          reportDisplay(row).service || "",
          reportDisplay(row).provider || "",
          String(reportGrossValue(row) || reportDisplay(row).gross || ""),
          String(reportNetValue(row) || reportDisplay(row).net || ""),
          row["Payment type"] || "",
        ]),
      ]
    : [
        ["Report", "Metric", "Value"],
        [title, "This month", "$18,420"],
        [title, "Last month", "$15,980"],
        [title, "Change", "+15.3%"],
        [title, "Assistant summary", "Supplies increased 15% for two months. Retail attach rate rose to 31%. Rebooking is strongest before checkout."],
      ];
  return (
    <PageShell eyebrow="Reports" title={`${title}.`} intro={hasImportedData ? "Imported financial rows from Google Sheets are shown here. Assistants use this report layer before giving recommendations." : "Demo report data now. Import past financial CSV/XLSX files from the Reports dashboard to replace this with live history."} wide>
      {isSalesReport ? <SalesReportFilters /> : null}
      {isSalesTrends ? <SalesTrendsGraph /> : null}
      <a href={csvHref(reportRows)} download={`bare-studios-${slug}.csv`} className="mb-5 inline-flex rounded-md bg-gradient-brand px-4 py-2 text-sm font-medium text-white">
        Download CSV
      </a>
      <section className="grid gap-4 md:grid-cols-4">
        {(hasImportedData
          ? [["Rows", String(summary.rowCount)], ["Gross sales", money(summary.grossSales)], ["Net sales", money(summary.netSales)], ["Fees", money(summary.fees)]]
          : [["This month", "$18,420"], ["Last month", "$15,980"], ["Change", "+15.3%"], ["Agent confidence", "Demo"]]
        ).map(([label, value]) => (
          <div key={label} className="rounded-xl border border-border bg-surface p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-text-muted">{label}</p>
            <p className="mt-2 font-serif text-3xl">{value}</p>
          </div>
        ))}
      </section>
      <section className="mt-6 rounded-xl border border-border bg-surface p-6">
        <p className="font-serif text-2xl font-medium">Assistant-readable summary</p>
        <p className="mt-3 text-sm leading-7 text-text-secondary">
          {hasImportedData
            ? `${summary.rowCount} imported rows are available. Gross sales total ${money(summary.grossSales)}, net sales total ${money(summary.netSales)}, tips ${money(summary.tips)}, fees ${money(summary.fees)}, and discounts ${money(summary.discounts)}.`
            : "Supplies increased 15% for two months. Retail attach rate rose to 31%. Rebooking is strongest when the provider offers the next appointment before checkout. Suggested action: review pricing, cue checkout add-ons, and have the Financial Assistant include this in the weekly executive document."}
        </p>
      </section>
      {hasImportedData && (
        <section className="mt-6 rounded-xl border border-border bg-white p-6">
          <p className="font-serif text-2xl font-medium">Recent imported rows</p>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.12em] text-text-muted">
                <tr>
                  {["Date", "Client", "Service", "Provider", "Gross", "Net"].map((header) => (
                    <th key={header} className="border-b border-border px-3 py-2 font-medium">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {summary.recentRows.map((row, index) => (
                  <tr key={`${reportDisplay(row).date}-${reportDisplay(row).client}-${index}`}>
                    <td className="border-b border-border px-3 py-2">{reportDisplay(row).date || row.Added || "-"}</td>
                    <td className="border-b border-border px-3 py-2">{reportDisplay(row).client || "-"}</td>
                    <td className="border-b border-border px-3 py-2">{reportDisplay(row).service || row["Report type"] || "-"}</td>
                    <td className="border-b border-border px-3 py-2">{reportDisplay(row).provider || "-"}</td>
                    <td className="border-b border-border px-3 py-2">{money(reportGrossValue(row))}</td>
                    <td className="border-b border-border px-3 py-2">{money(reportNetValue(row))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </PageShell>
  );
}
