"use client";
import { useEffect, useMemo, useState } from "react";
import { BARE_SERVICE_CATEGORIES, BARE_STUDIOS, BARE_TIME_SLOTS, NA_LASH_TIME_SLOTS } from "@/lib/bare-studios";

const inputClass =
  "w-full rounded-md border border-border bg-white px-3 py-2.5 text-sm text-text-primary outline-none focus:border-text-primary placeholder:text-text-muted";

const allServices = BARE_SERVICE_CATEGORIES.flatMap((category) =>
  category.services.map((service) => ({ ...service, category: category.name })),
);

const defaultCategory = "Barbering";
const defaultService = BARE_SERVICE_CATEGORIES.find((category) => category.name === defaultCategory)?.services[0] ?? allServices[0];

function providerOptions(service: typeof allServices[number] | undefined) {
  if (!service) return ["First available"];
  if (service.kind === "barber") return ["Andy"];
  if (service.kind === "womensHair") return ["Cindy"];
  if (service.kind === "lashExtensions" || service.kind === "lash") return ["Ciara", "Na"];
  if (["facial", "body", "brow", "waxing", "addon"].includes(service.kind)) return ["Ciara"];
  return ["First available"];
}

export default function BareBookingFlow() {
  const [categoryName, setCategoryName] = useState(defaultCategory);
  const [serviceName, setServiceName] = useState(defaultService?.name || "");
  const [artist, setArtist] = useState("Andy");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState(BARE_TIME_SLOTS[0]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedCategory = useMemo(
    () => BARE_SERVICE_CATEGORIES.find((category) => category.name === categoryName) ?? BARE_SERVICE_CATEGORIES[0],
    [categoryName],
  );
  const selectedService = useMemo(() => allServices.find((service) => service.name === serviceName), [serviceName]);
  const isBarbering = selectedService?.kind === "barber";
  const isWomensHair = selectedService?.kind === "womensHair";
  const availableProviders = useMemo(() => providerOptions(selectedService), [selectedService]);
  const timeSlots = artist === "Na" ? NA_LASH_TIME_SLOTS : BARE_TIME_SLOTS;
  const barberDigits = BARE_STUDIOS.barberPhone.replace(/[^0-9]/g, "");
  const cindyDigits = BARE_STUDIOS.womensHairPhone.replace(/[^0-9]/g, "");

  function validateProviderAvailability() {
    if (!preferredDate) return null;
    const selectedDate = new Date(`${preferredDate}T12:00:00`);
    if (artist === "Na" && selectedDate.getDay() !== 0) {
      return "Selected provider is not available for that date. Please choose another provider or date.";
    }
    if (artist === "Ciara" && preferredDate > "2026-08-01") {
      return "Selected provider is not available for that date. Please choose another provider or date.";
    }
    return null;
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const service = params.get("service");
    const match = allServices.find((option) => option.name === service);
    if (match) {
      setCategoryName(match.category);
      setServiceName(match.name);
    }
  }, []);

  useEffect(() => {
    const nextService = selectedCategory?.services[0];
    if (nextService && !selectedCategory.services.some((service) => service.name === serviceName)) {
      setServiceName(nextService.name);
    }
  }, [categoryName, selectedCategory, serviceName]);

  useEffect(() => {
    setArtist(availableProviders[0] || "First available");
    setPreferredTime((availableProviders[0] === "Na" ? NA_LASH_TIME_SLOTS : BARE_TIME_SLOTS)[0]);
  }, [serviceName, availableProviders]);

  useEffect(() => {
    const availableSlots = artist === "Na" ? NA_LASH_TIME_SLOTS : BARE_TIME_SLOTS;
    if (!availableSlots.includes(preferredTime)) {
      setPreferredTime(availableSlots[0]);
    }
  }, [artist, preferredTime]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (isBarbering || isWomensHair) return;
    const availabilityError = validateProviderAvailability();
    if (availabilityError) {
      setError(availabilityError);
      return;
    }
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
      setError("Network error - please try again.");
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
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="rounded-xl border border-border bg-surface p-5">
        <p className="text-[11px] uppercase tracking-[0.2em] text-text-muted">Choose service</p>
        <div className="mt-4 grid gap-3">
          <label className="grid gap-1 text-sm text-text-secondary">
            Service type
            <select className={inputClass} value={categoryName} onChange={(e) => setCategoryName(e.target.value)} aria-label="Service type">
              {BARE_SERVICE_CATEGORIES.map((category, index) => (
                <option key={category.name} value={category.name}>{index + 1}. {category.name}</option>
              ))}
            </select>
          </label>

          <label className="grid gap-1 text-sm text-text-secondary">
            Service
            <select className={inputClass} value={serviceName} onChange={(e) => setServiceName(e.target.value)} aria-label="Service">
              {selectedCategory.services.map((service) => (
                <option key={service.name} value={service.name}>{service.name} - {service.price} / {service.duration}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-5 rounded-md border border-border bg-surface-elevated p-4">
          <p className="font-serif text-2xl">{selectedService?.name || "Select a service"}</p>
          <p className="mt-1 text-sm text-text-secondary">{selectedService?.category} · {selectedService?.price} · {selectedService?.duration}</p>
          {selectedService?.description && <p className="mt-3 text-sm leading-relaxed text-text-secondary">{selectedService.description}</p>}
          {selectedService?.bestFor && <p className="mt-3 text-xs uppercase tracking-[0.12em] text-text-muted">Best for: {selectedService.bestFor}</p>}
          {selectedService?.note && <p className="mt-3 text-sm leading-relaxed text-text-secondary">{selectedService.note}</p>}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface p-5">
        <p className="text-[11px] uppercase tracking-[0.2em] text-text-muted">Appointment request</p>

        {isBarbering ? (
          <div className="mt-4 rounded-md border border-border bg-white p-5">
            <p className="font-serif text-2xl font-medium">Hmm, seems like Andy is booked online.</p>
            <p className="mt-3 text-sm leading-relaxed text-text-secondary">
              For barbering, it is best to call or text Andy directly at {BARE_STUDIOS.barberPhone}.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a href={`tel:${barberDigits}`} className="rounded-sm bg-gradient-brand px-6 py-3 text-[12px] uppercase tracking-[0.14em] text-white">
                Call Andy
              </a>
              <a href={`sms:${barberDigits}`} className="rounded-sm border border-text-primary/30 px-6 py-3 text-[12px] uppercase tracking-[0.14em]">
                Text Andy
              </a>
            </div>
          </div>
        ) : isWomensHair ? (
          <div className="mt-4 rounded-md border border-border bg-white p-5">
            <p className="font-serif text-2xl font-medium">Women&apos;s hair books directly with Cindy.</p>
            <p className="mt-3 text-sm leading-relaxed text-text-secondary">
              For women&apos;s hair appointments, it is best to call or text Cindy directly at {BARE_STUDIOS.womensHairPhone}.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a href={`tel:${cindyDigits}`} className="rounded-sm bg-gradient-brand px-6 py-3 text-[12px] uppercase tracking-[0.14em] text-white">
                Call Cindy
              </a>
              <a href={`sms:${cindyDigits}`} className="rounded-sm border border-text-primary/30 px-6 py-3 text-[12px] uppercase tracking-[0.14em]">
                Text Cindy
              </a>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-4 grid gap-3">
              <select className={inputClass} value={artist} onChange={(e) => setArtist(e.target.value)} aria-label="Provider">
                {availableProviders.map((option) => <option key={option}>{option}</option>)}
              </select>
              <div className="grid gap-3 sm:grid-cols-2">
                <input className={inputClass} type="date" value={preferredDate} onChange={(e) => setPreferredDate(e.target.value)} aria-label="Preferred date" />
                <select className={inputClass} value={preferredTime} onChange={(e) => setPreferredTime(e.target.value)} aria-label="Preferred time">
                  {timeSlots.map((slot) => <option key={slot}>{slot}</option>)}
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
          </>
        )}
      </section>
    </form>
  );
}
