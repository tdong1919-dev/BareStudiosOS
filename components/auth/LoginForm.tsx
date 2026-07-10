"use client";
import { useState } from "react";

const inputClass =
  "w-full rounded-md border border-border bg-white px-3 py-2.5 text-sm text-text-primary outline-none focus:border-text-primary placeholder:text-text-muted";

export default function LoginForm() {
  const [mode, setMode] = useState<"sign-in" | "create">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setError("Enter your email.");
      return;
    }
    if (!password) {
      setError("Enter your password.");
      return;
    }
    if (mode === "create" && !businessName.trim()) {
      setError("Enter your business name.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(mode === "create" ? "/api/auth/register" : "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, businessName }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error || "Something went wrong.");
        return;
      }
      window.location.href = mode === "create" ? "/onboarding" : "/dashboard";
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-border bg-surface p-6 space-y-3">
      <div className="grid grid-cols-2 gap-2 rounded-md border border-border bg-surface-elevated p-1">
        <button
          type="button"
          onClick={() => {
            setMode("sign-in");
            setError(null);
          }}
          className={`rounded-sm px-4 py-2 text-[11px] uppercase tracking-[0.14em] ${
            mode === "sign-in" ? "bg-white text-text-primary shadow-sm" : "text-text-secondary"
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("create");
            setError(null);
          }}
          className={`rounded-sm px-4 py-2 text-[11px] uppercase tracking-[0.14em] ${
            mode === "create" ? "bg-white text-text-primary shadow-sm" : "text-text-secondary"
          }`}
        >
          Create account
        </button>
      </div>
      <input className={inputClass} type="email" placeholder="you@yoursalon.com" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Email" />
      <input
        className={inputClass}
        type="password"
        placeholder={mode === "create" ? "Create a password" : "Password"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        aria-label="Password"
        minLength={mode === "create" ? 8 : undefined}
      />
      {mode === "create" && (
        <input
          className={inputClass}
          placeholder="Business name"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          aria-label="Business name"
        />
      )}
      {error && <p className="text-sm text-error">{error}</p>}
      <button type="submit" disabled={submitting} className="w-full rounded-sm bg-gradient-brand px-6 py-3.5 text-[12px] uppercase tracking-[0.14em] text-white disabled:opacity-50">
        {submitting ? "Working…" : mode === "create" ? "Create password and continue" : "Sign in"}
      </button>
      <p className="text-xs text-text-muted text-center">
        {mode === "create" ? "Next, we will collect your business setup details before dashboard access." : "Use the password you created for this account."}
      </p>
    </form>
  );
}
