"use client";
import { useState } from "react";

const featureOptions = [
  "Booking replacement",
  "Lower payment fees and client wallet",
  "Client retention and rewards",
  "Inventory tracking and reorder assistant",
  "Social media and marketing scheduling",
  "Reviews assistant",
  "Financial reports and payroll visibility",
  "Team scheduling and multi-location visibility",
];

const inputClass =
  "w-full rounded-md border border-border bg-white px-3 py-2.5 text-sm text-text-primary outline-none focus:border-text-primary placeholder:text-text-muted";

export default function OnboardingForm({ defaultBusinessName }: { defaultBusinessName: string }) {
  const [businessName, setBusinessName] = useState(defaultBusinessName);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [teamAccountsNeeded, setTeamAccountsNeeded] = useState("3");
  const [hasMultipleLocations, setHasMultipleLocations] = useState(false);
  const [primaryLocation, setPrimaryLocation] = useState(defaultBusinessName);
  const [notes, setNotes] = useState("");
  const [features, setFeatures] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleFeature(feature: string) {
    if (feature === "All of the above") {
      setFeatures(features.includes(feature) ? [] : ["All of the above"]);
      return;
    }
    const withoutAll = features.filter((f) => f !== "All of the above");
    setFeatures(withoutAll.includes(feature) ? withoutAll.filter((f) => f !== feature) : [...withoutAll, feature]);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName,
          address,
          phone,
          teamAccountsNeeded,
          features,
          hasMultipleLocations,
          primaryLocation,
          notes,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error || "Couldn't save the setup.");
        return;
      }
      window.location.href = "/dashboard";
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5 rounded-xl border border-border bg-surface p-6">
      <div className="grid gap-3 sm:grid-cols-2">
        <input className={inputClass} value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Business name" aria-label="Business name" />
        <input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" aria-label="Phone number" />
      </div>
      <input className={inputClass} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Business address" aria-label="Business address" />
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          className={inputClass}
          type="number"
          min="1"
          value={teamAccountsNeeded}
          onChange={(e) => setTeamAccountsNeeded(e.target.value)}
          placeholder="Team accounts needed"
          aria-label="Team accounts needed"
        />
        <input
          className={inputClass}
          value={primaryLocation}
          onChange={(e) => setPrimaryLocation(e.target.value)}
          placeholder="Primary location name"
          aria-label="Primary location"
        />
      </div>

      <label className="flex items-start gap-3 rounded-md border border-border bg-surface-elevated p-4 text-sm text-text-secondary">
        <input className="mt-1" type="checkbox" checked={hasMultipleLocations} onChange={(e) => setHasMultipleLocations(e.target.checked)} />
        <span>We have multiple locations or plan to add another location.</span>
      </label>

      <div>
        <p className="mb-3 text-[11px] uppercase tracking-[0.18em] text-text-muted">What are you most excited for?</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {["All of the above", ...featureOptions].map((feature) => (
            <label key={feature} className="flex items-start gap-3 rounded-md border border-border bg-white p-3 text-sm text-text-secondary">
              <input className="mt-1" type="checkbox" checked={features.includes(feature)} onChange={() => toggleFeature(feature)} />
              <span>{feature}</span>
            </label>
          ))}
        </div>
      </div>

      <textarea className={`${inputClass} min-h-24`} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything we should know before migration?" aria-label="Migration notes" />

      {error && <p className="text-sm text-error">{error}</p>}
      <button type="submit" disabled={submitting} className="w-full rounded-sm bg-gradient-brand px-6 py-3.5 text-[12px] uppercase tracking-[0.14em] text-white disabled:opacity-50">
        {submitting ? "Saving..." : "Save setup and enter dashboard"}
      </button>
    </form>
  );
}
