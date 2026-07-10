/**
 * Passwordless auth core. No passwords are stored anywhere — sign-in is via a
 * short-lived emailed magic link, and the session is a signed (HMAC-SHA256)
 * token in an httpOnly cookie. The salon/role ride inside the token, so the
 * callback doesn't need to re-read the sheet (avoids gviz lag).
 *
 * Needs AUTH_SECRET (any long random string).
 */
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const MAGIC_TTL = 15 * 60 * 1000; // 15 min
const SESSION_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days
export const SESSION_COOKIE = "jcs_session";

export type Session = { email: string; salon: string; role: string };

function secret(): string {
  return process.env.AUTH_SECRET || "";
}

function sign(payload: object): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

function verify(token: string): Record<string, unknown> | null {
  if (!secret() || !token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = crypto.createHmac("sha256", secret()).update(body).digest("base64url");
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    const payload = JSON.parse(Buffer.from(body, "base64url").toString());
    if (typeof payload.exp === "number" && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export function signMagic(s: Session): string {
  return sign({ t: "magic", ...s, exp: Date.now() + MAGIC_TTL });
}

export function verifyMagic(token: string): Session | null {
  const p = verify(token);
  if (!p || p.t !== "magic") return null;
  return { email: String(p.email), salon: String(p.salon), role: String(p.role) };
}

export function signSession(s: Session): string {
  return sign({ t: "session", ...s, exp: Date.now() + SESSION_TTL });
}

export function verifySession(token: string): Session | null {
  const p = verify(token);
  if (!p || p.t !== "session") return null;
  return { email: String(p.email), salon: String(p.salon), role: String(p.role) };
}

export const SESSION_MAX_AGE = SESSION_TTL / 1000;

/** Read the current session from the cookie (server components / route handlers). */
export async function getSession(): Promise<Session | null> {
  const c = await cookies();
  const token = c.get(SESSION_COOKIE)?.value;
  return token ? verifySession(token) : null;
}

/** For owner-only server components: redirect to /login when not signed in. */
export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}
