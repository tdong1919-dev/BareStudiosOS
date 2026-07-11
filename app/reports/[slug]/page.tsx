import type { Metadata } from "next";
import PageShell from "@/components/marketing/PageShell";
import { requireSession } from "@/lib/auth";
import {
  getFinancialReportRows,
  money,
  rowsForReportSlug,
  summarizeFinancialRows,
  titleFromReportSlug,
} from "@/lib/financial-reports";

export const metadata: Metadata = { title: "Report Detail - Bare Studios OS" };

function csvHref(rows: string[][]) {
  const csv = rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(",")).join("\n");
  return `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
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
  const reportRows = hasImportedData
    ? [
        ["Report type", "Date", "Client", "Service", "Provider", "Gross sales", "Net sales", "Payment type"],
        ...activeRows.map((row) => [
          row["Report type"] || title,
          row.Date || "",
          row.Client || "",
          row.Service || "",
          row.Provider || "",
          row["Gross sales"] || "",
          row["Net sales"] || "",
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
                  <tr key={`${row.Date}-${row.Client}-${index}`}>
                    <td className="border-b border-border px-3 py-2">{row.Date || row.Added || "-"}</td>
                    <td className="border-b border-border px-3 py-2">{row.Client || "-"}</td>
                    <td className="border-b border-border px-3 py-2">{row.Service || row["Report type"] || "-"}</td>
                    <td className="border-b border-border px-3 py-2">{row.Provider || "-"}</td>
                    <td className="border-b border-border px-3 py-2">{row["Gross sales"] || "-"}</td>
                    <td className="border-b border-border px-3 py-2">{row["Net sales"] || "-"}</td>
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
