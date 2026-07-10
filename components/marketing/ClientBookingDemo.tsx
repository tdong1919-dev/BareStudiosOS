"use client";

import { useState } from "react";

const STEPS = [
  {
    key: "service",
    label: "Service",
    title: "Balayage refresh",
    meta: "2 hr 15 min · from $225",
    detail: "Client picks the service, sees the time estimate, and knows the starting price before booking.",
  },
  {
    key: "time",
    label: "Time",
    title: "Today at 2:30 PM",
    meta: "With Jordan · last-minute opening",
    detail: "Openings can be sent directly to waitlisted clients so a cancellation becomes a booked slot.",
  },
  {
    key: "wallet",
    label: "Wallet",
    title: "Wallet balance: $300",
    meta: "Apply funds · lower repeat card fees",
    detail: "The client can pay a deposit or checkout from wallet funds, while cards remain available as backup.",
  },
] as const;

type StepKey = (typeof STEPS)[number]["key"];

export default function ClientBookingDemo() {
  const [activeKey, setActiveKey] = useState<StepKey>("service");
  const active = STEPS.find((step) => step.key === activeKey) ?? STEPS[0];

  return (
    <div className="grid grid-cols-1 gap-6 rounded-lg border border-border bg-surface-elevated p-5 md:grid-cols-[1fr_0.78fr] md:p-8">
      <div>
        <div className="grid grid-cols-3 gap-2">
          {STEPS.map((step) => (
            <button
              key={step.key}
              type="button"
              onClick={() => setActiveKey(step.key)}
              className="rounded-md border px-3 py-3 text-left text-xs transition-colors"
              style={
                step.key === activeKey
                  ? { borderColor: "var(--color-primary)", backgroundColor: "#fff", color: "var(--color-text-primary)" }
                  : { borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }
              }
            >
              <span className="block text-[11px] uppercase tracking-[0.12em]">{step.label}</span>
              <span className="mt-1 block font-serif text-lg normal-case tracking-normal">{step.title}</span>
            </button>
          ))}
        </div>

        <div className="mt-6 rounded-md border border-border bg-white p-6">
          <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted">Desktop preview</p>
          <h3 className="mt-3 font-serif text-3xl font-medium">{active.title}</h3>
          <p className="mt-2 text-sm text-text-secondary">{active.meta}</p>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-text-secondary">{active.detail}</p>
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button className="rounded-sm bg-gradient-brand px-5 py-3 text-[12px] uppercase tracking-[0.12em] text-white">
              Continue booking
            </button>
            <button className="rounded-sm border border-text-primary/30 px-5 py-3 text-[12px] uppercase tracking-[0.12em] text-text-primary">
              Ask a question
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[284px] rounded-[36px] border border-text-primary bg-text-primary p-2 shadow-sm">
        <div className="min-h-[520px] rounded-[30px] bg-white p-4">
          <div className="mx-auto mb-5 h-1.5 w-16 rounded-full bg-border" />
          <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted">Mobile booking</p>
          <h4 className="mt-2 font-serif text-2xl font-medium">{active.title}</h4>
          <p className="mt-2 text-sm text-text-secondary">{active.meta}</p>
          <div className="mt-5 rounded-2xl border border-border bg-surface-elevated p-4">
            <p className="text-sm leading-relaxed text-text-secondary">{active.detail}</p>
          </div>
          <div className="mt-5 space-y-2">
            {STEPS.map((step) => (
              <button
                key={step.key}
                type="button"
                onClick={() => setActiveKey(step.key)}
                className="flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm"
                style={
                  step.key === activeKey
                    ? { borderColor: "var(--color-primary)", color: "var(--color-text-primary)" }
                    : { borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }
                }
              >
                <span>{step.label}</span>
                <span>{step.key === activeKey ? "Current" : "View"}</span>
              </button>
            ))}
          </div>
          <button className="mt-5 w-full rounded-xl bg-primary py-3 text-sm font-medium text-white">Confirm appointment</button>
        </div>
      </div>
    </div>
  );
}
