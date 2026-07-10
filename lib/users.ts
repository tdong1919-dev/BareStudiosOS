/** User lookup from the Users tab (non-secret: email, salon, role, status). */
import { readSheetTab } from "@/lib/gviz";

export const USER_HEADERS = ["Created", "Email", "Salon", "Role", "Status"];

export type UserRecord = { email: string; salon: string; role: string; status: string };

export async function findUser(email: string): Promise<UserRecord | null> {
  const target = email.trim().toLowerCase();
  const rows = await readSheetTab("Users");
  for (let i = rows.length - 1; i >= 0; i--) {
    const r = rows[i];
    if ((r.Email || "").trim().toLowerCase() === target) {
      return { email: r.Email, salon: r.Salon || "", role: r.Role || "owner", status: r.Status || "active" };
    }
  }
  return null;
}
