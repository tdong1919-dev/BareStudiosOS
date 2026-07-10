/** Shared re-engagement logic: which clients are overdue to rebook. */
const DAY = 24 * 60 * 60 * 1000;

export type OverdueClient = {
  name: string;
  email: string;
  phone: string;
  service: string;
  daysSince: number;
  interval: number;
  overdueBy: number;
};

export function overdueClients(rows: Record<string, string>[], now = Date.now()): OverdueClient[] {
  return rows
    .map((r) => {
      const last = Date.parse(r["Last visit"]);
      const interval = Math.round(Number(r["Interval days"]) || 0);
      if (Number.isNaN(last) || !interval) return null;
      const daysSince = Math.floor((now - last) / DAY);
      return {
        name: r.Name || "Client",
        email: r.Email || "",
        phone: r.Phone || "",
        service: r.Service || "",
        daysSince,
        interval,
        overdueBy: daysSince - interval,
      };
    })
    .filter((c): c is OverdueClient => c != null && c.overdueBy >= 0)
    .sort((a, b) => b.overdueBy - a.overdueBy);
}
