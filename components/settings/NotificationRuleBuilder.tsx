"use client";

import { useState } from "react";

type Rule = {
  id: string;
  audience: "Customer" | "Team";
  automation: string;
  enabled: boolean;
  channel: string;
  timing: string;
  instruction: string;
};

const channelOptions = ["App, text, email", "Text and email", "Text only", "Email only", "App only", "Off"];

const startingRules: Rule[] = [
  {
    id: "appointment-confirmations",
    audience: "Customer",
    automation: "Appointment confirmations",
    enabled: true,
    channel: "App, text, email",
    timing: "Immediately after booking",
    instruction: "Send the client a confirmation with service, provider, date, time, address, and reschedule link.",
  },
  {
    id: "appointment-reminders",
    audience: "Customer",
    automation: "Appointment reminders",
    enabled: true,
    channel: "Text and email",
    timing: "48 hours and 4 hours before appointment",
    instruction: "Remind the client of their appointment and ask them to confirm or request changes.",
  },
  {
    id: "last-minute-openings",
    audience: "Customer",
    automation: "Last-minute openings",
    enabled: true,
    channel: "Text only",
    timing: "When an opening is posted",
    instruction: "Send eligible clients a short message about the open time and let them request it.",
  },
  {
    id: "review-request",
    audience: "Customer",
    automation: "Review request",
    enabled: true,
    channel: "Text and email",
    timing: "2 hours after checkout",
    instruction: "Ask happy clients to leave an honest review and mention the free gift if the promotion is active.",
  },
  {
    id: "low-inventory",
    audience: "Team",
    automation: "Low inventory",
    enabled: true,
    channel: "App, text, email",
    timing: "When quantity drops below the product threshold",
    instruction: "Notify the owner or inventory manager with product name, quantity left, and reorder suggestion.",
  },
  {
    id: "reviews-under-3",
    audience: "Team",
    automation: "Reviews under 3 stars",
    enabled: true,
    channel: "Text and email",
    timing: "Instantly",
    instruction: "Notify the owner and manager, draft a professional response, and remind them to contact the client.",
  },
];

const inputClass = "w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none focus:border-text-primary";

export default function NotificationRuleBuilder() {
  const [rules, setRules] = useState(startingRules);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function update(id: string, patch: Partial<Rule>) {
    setRules((current) => current.map((rule) => (rule.id === id ? { ...rule, ...patch } : rule)));
  }

  async function save() {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const res = await fetch("/api/settings/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rules }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error || "Could not save automations.");
        return;
      }
      setMessage(`Saved ${json.saved || rules.length} automation rules. The backend will use these as the routing plan.`);
    } catch {
      setError("Network error. Try saving again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-xl border border-border bg-surface p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted">Automation rules</p>
          <p className="mt-2 max-w-2xl text-sm text-text-secondary">
            Each row is saved as a backend-readable rule: what triggers it, who receives it, where it sends, when it runs, and the exact instruction.
          </p>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-sm bg-gradient-brand px-5 py-3 text-[12px] uppercase tracking-[0.14em] text-white disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save automations"}
        </button>
      </div>

      <div className="mt-5 overflow-hidden rounded-lg border border-border">
        {rules.map((rule, index) => (
          <article key={rule.id} className={`bg-white p-4 ${index > 0 ? "border-t border-border" : ""}`}>
            <div className="grid gap-3 lg:grid-cols-[0.8fr_0.8fr_0.8fr_1.4fr]">
              <label className="flex items-start gap-3 font-medium">
                <input className="mt-1" type="checkbox" checked={rule.enabled} onChange={(event) => update(rule.id, { enabled: event.target.checked })} />
                <span>{rule.automation}</span>
              </label>

              <select className={inputClass} value={rule.channel} onChange={(event) => update(rule.id, { channel: event.target.value })} aria-label={`${rule.automation} channel`}>
                {channelOptions.map((option) => <option key={option}>{option}</option>)}
              </select>

              <input className={inputClass} value={rule.timing} onChange={(event) => update(rule.id, { timing: event.target.value })} aria-label={`${rule.automation} timing`} />

              <textarea
                className={`${inputClass} min-h-20 resize-y`}
                value={rule.instruction}
                onChange={(event) => update(rule.id, { instruction: event.target.value })}
                aria-label={`${rule.automation} instruction`}
              />
            </div>
          </article>
        ))}
      </div>

      {message && <p className="mt-4 rounded-md border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">{message}</p>}
      {error && <p className="mt-4 rounded-md border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">{error}</p>}
    </section>
  );
}
