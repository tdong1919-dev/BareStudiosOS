"use client";
/**
 * WalletPanel — load funds (real Stripe Checkout on the salon's connected
 * account) and pay from balance (internal debit, no fee). Balance reads from
 * the Wallet ledger via /api/wallet/balance.
 */
import { useCallback, useEffect, useState } from "react";

const inputClass =
  "w-full rounded-md border border-border bg-white px-3 py-2.5 text-sm text-text-primary outline-none focus:border-text-primary placeholder:text-text-muted";

const LOAD_AMOUNTS = [300, 500, 1000, 2000, 5000, 7000, 10000];

const UPCOMING_SERVICES = [
  { id: "today", date: "Today", name: "Lash refill", provider: "Jordan", price: 225 },
  { id: "friday", date: "Friday", name: "Hydrating facial", provider: "Ari", price: 165 },
  { id: "next-week", date: "Next week", name: "Brow shaping", provider: "Mina", price: 65 },
] as const;

type TipChoice = "none" | "15" | "20" | "custom";

export default function WalletPanel({
  initialSalon = "",
  initialClient = "",
  loaded = false,
  demo = false,
}: {
  initialSalon?: string;
  initialClient?: string;
  loaded?: boolean;
  demo?: boolean;
}) {
  const businessName = initialSalon.trim() || "[Business Name]";
  const [client, setClient] = useState(initialClient || "Demo Customer/Patient");
  const [amount, setAmount] = useState("300");
  const [customAmount, setCustomAmount] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<(typeof UPCOMING_SERVICES)[number]["id"]>("today");
  const [allowTips, setAllowTips] = useState(true);
  const [tipChoice, setTipChoice] = useState<TipChoice>("none");
  const [customTip, setCustomTip] = useState("");
  const [balance, setBalance] = useState<number | null>(demo ? 300 : null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(loaded ? "Payment received — balance updates within a few seconds (ACH may take a few days to clear)." : null);

  const selectedService = UPCOMING_SERVICES.find((service) => service.id === selectedServiceId) ?? UPCOMING_SERVICES[0];
  const tipAmount = allowTips
    ? tipChoice === "15"
      ? selectedService.price * 0.15
      : tipChoice === "20"
        ? selectedService.price * 0.2
        : tipChoice === "custom"
          ? Number(customTip) || 0
          : 0
    : 0;
  const totalDue = selectedService.price + tipAmount;

  const refreshBalance = useCallback(async () => {
    if (!businessName.trim() || !client.trim()) return;
    if (demo) {
      setBalance((current) => current ?? 300);
      setInfo("Sample balance refreshed.");
      return;
    }
    try {
      const res = await fetch(`/api/wallet/balance?salon=${encodeURIComponent(businessName)}&client=${encodeURIComponent(client)}`);
      const json = await res.json().catch(() => ({}));
      if (res.ok) setBalance(json.balance);
    } catch {
      /* ignore */
    }
  }, [businessName, client, demo]);

  useEffect(() => {
    if (initialSalon && initialClient) refreshBalance();
  }, [initialSalon, initialClient, refreshBalance]);

  async function load() {
    setError(null);
    if (!businessName.trim() || !client.trim()) {
      setError("Enter the business and customer/patient.");
      return;
    }
    if (Number(amount) <= 0) {
      setError("Choose a wallet load amount.");
      return;
    }
    if (demo) {
      setBalance((current) => (current ?? 0) + Number(amount || 0));
      setInfo(`Sample load added $${Number(amount || 0).toFixed(2)} to the wallet.`);
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/wallet/load", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ salon: businessName, client, amount: Number(amount) }) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.url) {
        setError(json.error || "Couldn't start checkout.");
        return;
      }
      window.location.href = json.url; // hosted Stripe Checkout
    } catch {
      setError("Network error — please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function pay() {
    setError(null);
    setInfo(null);
    const amt = Number(totalDue.toFixed(2));
    if (!businessName.trim() || !client.trim() || !amt) {
      setError("Enter business, customer/patient, and a service to pay.");
      return;
    }
    if (demo) {
      const current = balance ?? 300;
      if (amt > current) {
        setError(`Sample wallet only has $${current.toFixed(2)} available.`);
        return;
      }
      setBalance(current - amt);
      setTipChoice("none");
      setCustomTip("");
      setInfo(`Sample payment complete for ${selectedService.name} — no card fee.`);
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/wallet/charge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ salon: businessName, client, amount: amt, note: `${selectedService.name}${tipAmount ? " + tip" : ""}` }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error || "Couldn't charge the wallet.");
        if (typeof json.balance === "number") setBalance(json.balance);
        return;
      }
      setBalance(json.balance);
      setTipChoice("none");
      setCustomTip("");
      setInfo("Paid from wallet — no card fee.");
    } catch {
      setError("Network error — please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-surface p-6 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-md border border-border bg-white px-3 py-2.5">
            <p className="text-[11px] uppercase tracking-[0.14em] text-text-muted">Business</p>
            <p className="mt-1 text-sm text-text-primary">{businessName}</p>
          </div>
          <input className={inputClass} placeholder="Customer or patient" value={client} onChange={(e) => setClient(e.target.value)} aria-label="Customer or patient" />
        </div>
        <button type="button" onClick={refreshBalance} className="text-[12px] uppercase tracking-[0.12em] text-text-secondary hover:text-text-primary">
          Check balance
        </button>
        {balance !== null && (
          <div className="flex items-baseline gap-2">
            <span className="text-xs text-text-secondary">Wallet balance</span>
            <span className="font-serif text-3xl font-medium">${balance.toFixed(2)}</span>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-surface p-6 space-y-3">
        <p className="text-[11px] uppercase tracking-[0.16em] text-text-muted">Load funds</p>
        <div className="flex flex-wrap items-center gap-2">
          {LOAD_AMOUNTS.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => {
                setAmount(String(v));
                setCustomAmount(false);
              }}
              className={`rounded-full border px-3 py-1.5 text-[12px] hover:bg-black/[0.03] ${amount === String(v) && !customAmount ? "border-text-primary text-text-primary" : "border-border text-text-secondary"}`}
            >
              ${v}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setCustomAmount(true);
              setAmount("");
            }}
            className={`rounded-full border px-3 py-1.5 text-[12px] hover:bg-black/[0.03] ${customAmount ? "border-text-primary text-text-primary" : "border-border text-text-secondary"}`}
          >
            Custom
          </button>
          {customAmount && (
            <input className={`${inputClass} w-32`} type="number" min={1} value={amount} onChange={(e) => setAmount(e.target.value)} aria-label="Custom load amount" />
          )}
        </div>
        <button type="button" onClick={load} disabled={busy} className="rounded-sm bg-gradient-brand px-6 py-3 text-[12px] uppercase tracking-[0.14em] text-white disabled:opacity-50">
          {busy ? "…" : "Load by bank (ACH) or card"}
        </button>
        <p className="text-xs text-text-muted">ACH keeps fees low. Funds settle to the salon&apos;s own Stripe.</p>
      </div>

      <div className="rounded-xl border border-border bg-surface p-6 space-y-3">
        <p className="text-[11px] uppercase tracking-[0.16em] text-text-muted">Pay for a service</p>
        <div className="space-y-2">
          {UPCOMING_SERVICES.map((service) => {
            const selected = service.id === selectedServiceId;
            return (
              <button
                key={service.id}
                type="button"
                onClick={() => setSelectedServiceId(service.id)}
                className={`w-full rounded-md border bg-white p-3 text-left transition-colors ${selected ? "border-text-primary" : "border-border"}`}
              >
                <span className="flex items-center justify-between gap-3">
                  <span>
                    <span className="block text-[11px] uppercase tracking-[0.14em] text-text-muted">{service.date}</span>
                    <span className="mt-1 block text-sm text-text-primary">{service.name} with {service.provider}</span>
                  </span>
                  <span className="text-sm font-medium">${service.price.toFixed(2)}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="rounded-md border border-border bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-text-primary">Owner setting: allow tips</p>
              <p className="mt-1 text-xs text-text-muted">Toggle controls whether wallet payments can include a tip.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setAllowTips((enabled) => !enabled);
                setTipChoice("none");
                setCustomTip("");
              }}
              className="relative h-7 w-12 rounded-full transition-colors"
              style={{ backgroundColor: allowTips ? "var(--color-success)" : "var(--color-border)" }}
              aria-pressed={allowTips}
              aria-label="Toggle tips"
            >
              <span
                className="absolute left-0 top-1 h-5 w-5 rounded-full bg-white transition-transform"
                style={{ transform: allowTips ? "translateX(24px)" : "translateX(4px)" }}
              />
            </button>
          </div>
        </div>

        {allowTips && (
          <div className="rounded-md border border-border bg-white p-4">
            <p className="text-[11px] uppercase tracking-[0.14em] text-text-muted">Tip</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                ["none", "No tip"],
                ["15", "15%"],
                ["20", "20%"],
                ["custom", "Custom"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTipChoice(value as TipChoice)}
                  className={`rounded-full border px-3 py-1.5 text-[12px] ${tipChoice === value ? "border-text-primary text-text-primary" : "border-border text-text-secondary"}`}
                >
                  {label}
                </button>
              ))}
            </div>
            {tipChoice === "custom" && (
              <input className={`${inputClass} mt-3 w-32`} type="number" min={0} value={customTip} onChange={(e) => setCustomTip(e.target.value)} aria-label="Custom tip amount" />
            )}
          </div>
        )}

        <div className="rounded-md border border-border bg-white p-4">
          <div className="flex justify-between text-sm text-text-secondary">
            <span>{selectedService.name}</span>
            <span>${selectedService.price.toFixed(2)}</span>
          </div>
          <div className="mt-2 flex justify-between text-sm text-text-secondary">
            <span>Tip</span>
            <span>${tipAmount.toFixed(2)}</span>
          </div>
          <div className="mt-3 flex justify-between border-t border-border pt-3 text-sm font-medium text-text-primary">
            <span>Total due</span>
            <span>${totalDue.toFixed(2)}</span>
          </div>
        </div>

        <div>
          <button type="button" onClick={pay} disabled={busy} className="rounded-sm border border-text-primary/30 px-6 py-3 text-[12px] uppercase tracking-[0.14em] text-text-primary hover:bg-black/[0.04] disabled:opacity-50">
            Pay from wallet
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-error">{error}</p>}
      {info && <p className="text-sm text-success">{info}</p>}
    </div>
  );
}
