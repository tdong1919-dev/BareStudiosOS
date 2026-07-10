"use client";
import { useEffect, useMemo, useState } from "react";
import { BARE_ARTISTS, BARE_SERVICE_CATEGORIES, BARE_TIME_SLOTS } from "@/lib/bare-studios";

const inputClass =
  "w-full rounded-md border border-border bg-white px-3 py-2.5 text-sm text-text-primary outline-none focus:border-text-primary placeholder:text-text-muted";

const allServices = BARE_SERVICE_CATEGORIES.flatMap((category) =>
  category.services.map((service) => ({ ...service, category: category.name })),
);

export default function BareBookingFlow() {
  const [serviceName, setServiceName] = useState(allServices[0]?.name || "");
  const [artist, setArtist] = useState(BARE_ARTISTS[0]);
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState(BARE_TIME_SLOTS[0]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedService = useMemo(() => allServices.find((service) => service.name === serviceName), [serviceName]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const service = params.get("service");
    if (service && allServices.some((option) => option.name === service)) {
      setServiceName(service);
    }
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service: serviceName, artist, preferredDate, preferredTime, name, email, phone, notes }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error || "Couldn't request this appointment.");
        return;
      }
      setSent(true);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-xl border border-border bg-surface p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success/15 text-success text-2xl">✓</div>
        <h2 className="font-serif text-3xl">Request received.</h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-text-secondary">
          Bare Studios has your appointment request. The studio will review availability and follow up to confirm your visit.
        </p>
        <button
          type="button"
          onClick={() => {
            setSent(false);
            setName("");
            setEmail("");
            setPhone("");
            setNotes("");
          }}
          className="mt-6 rounded-sm border border-text-primary/30 px-5 py-2.5 text-[12px] uppercase tracking-[0.14em]"
        >
          Book another service
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="rounded-xl border border-border bg-surface p-5">
        <p className="text-[11px] uppercase tracking-[0.2em] text-text-muted">Choose service</p>
        <div className="mt-4 space-y-4">
          {BARE_SERVICE_CATEGORIES.map((category) => (
            <div key={category.name}>
              <h3 className="font-serif text-xl">{category.name}</h3>
              <div className="mt-2 grid gap-2">
                {category.services.map((service) => (
                  <button
                    key={service.name}
                    type="button"
                    onClick={() => setServiceName(service.name)}
                    className={`rounded-md border p-3 text-left transition ${
                      serviceName === service.name ? "border-text-primary bg-surface-elevated" : "border-border bg-white hover:bg-surface-elevated"
                    }`}
                  >
                    <span className="block text-sm font-medium">{service.name}</span>
                    <span className="mt-1 block text-xs text-text-secondary">{service.duration} · {service.deposit}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface p-5">
        <p className="text-[11px] uppercase tracking-[0.2em] text-text-muted">Appointment request</p>
        <div className="mt-4 rounded-md border border-border bg-surface-elevated p-4">
          <p className="font-serif text-2xl">{selectedService?.name || "Select a service"}</p>
          <p className="mt-1 text-sm text-text-secondary">{selectedService?.category} · {selectedService?.duration}</p>
        </div>

        <div className="mt-4 grid gap-3">
          <select className={inputClass} value={artist} onChange={(e) => setArtist(e.target.value)} aria-label="Artist">
            {BARE_ARTISTS.map((option) => <option key={option}>{option}</option>)}
          </select>
          <div className="grid gap-3 sm:grid-cols-2">
            <input className={inputClass} type="date" value={preferredDate} onChange={(e) => setPreferredDate(e.target.value)} aria-label="Preferred date" />
            <select className={inputClass} value={preferredTime} onChange={(e) => setPreferredTime(e.target.value)} aria-label="Preferred time">
              {BARE_TIME_SLOTS.map((slot) => <option key={slot}>{slot}</option>)}
            </select>
          </div>
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" aria-label="Name" />
          <input className={inputClass} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" aria-label="Email" />
          <input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" aria-label="Phone" />
          <textarea className={`${inputClass} min-h-24`} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything we should know?" aria-label="Notes" />
        </div>

        {error && <p className="mt-3 text-sm text-error">{error}</p>}
        <button type="submit" disabled={submitting} className="mt-4 w-full rounded-sm bg-gradient-brand px-6 py-3.5 text-[12px] uppercase tracking-[0.14em] text-white disabled:opacity-50">
          {submitting ? "Saving..." : "Request appointment"}
        </button>
        <p className="mt-3 text-center text-xs text-text-muted">Appointment requests are reviewed by Bare Studios before confirmation.</p>
      </section>
    </form>
  );
}
