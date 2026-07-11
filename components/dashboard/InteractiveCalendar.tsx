"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Modal from "@/components/ui/Modal";

const week = ["Mon 6", "Tue 7", "Wed 8", "Thu 9", "Fri 10", "Sat 11", "Sun 12"];
const times = ["7 AM", "8 AM", "9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM", "7 PM", "8 PM", "9 PM", "10 PM", "11 PM", "12 AM", "1 AM", "2 AM", "3 AM", "4 AM", "5 AM", "6 AM", "7 AM"];

const appointments = [
  { day: 1, row: 1, title: "Classic fill", client: "Jasmine R.", staff: "Na", color: "bg-[#d9eadf]" },
  { day: 2, row: 3, title: "Custom facial", client: "Sandra M.", staff: "Ciara", color: "bg-[#ead9c3]" },
  { day: 4, row: 5, title: "Barber consult", client: "John B.", staff: "Andy", color: "bg-[#d8e3ef]" },
  { day: 6, row: 2, title: "Lash lift + tint", client: "Maya L.", staff: "Ciara", color: "bg-[#eadce7]" },
];

const clients = ["Jasmine R.", "Sandra M.", "John B.", "Maya L.", "New client"];
const services = ["Classic lash fill", "Custom facial", "Barbering", "Korean lash lift + tint", "Brow sculpt", "Full body treatment"];
const recommendations = [
  "Suggest lash cleanser and book 2 weeks out before client leaves.",
  "Ask about skin sensitivity and offer LED add-on if appropriate.",
  "Check retail history before checkout and offer replenishment.",
];
const promotions = ["No promotion", "July facial glow: 10% off add-ons", "Lash refill loyalty reward", "Retail cleanser bundle"];

type Slot = {
  day: string;
  time: string;
};

export default function InteractiveCalendar({
  clientsCount,
  openBookings,
  newConcierge,
  inventoryCount,
}: {
  clientsCount: number;
  openBookings: number;
  newConcierge: number;
  inventoryCount: number;
}) {
  const [slot, setSlot] = useState<Slot | null>(null);
  const [selectedClient, setSelectedClient] = useState(clients[0]);
  const [selectedService, setSelectedService] = useState(services[0]);
  const [approvedRecommendations, setApprovedRecommendations] = useState(() => new Set(recommendations));
  const slotTitle = useMemo(() => slot ? `${slot.day} at ${slot.time}` : "New appointment", [slot]);

  function toggleRecommendation(recommendation: string) {
    setApprovedRecommendations((current) => {
      const next = new Set(current);
      if (next.has(recommendation)) next.delete(recommendation);
      else next.add(recommendation);
      return next;
    });
  }

  return (
    <section className="overflow-hidden bg-white">
      <div className="flex flex-col gap-3 border-b border-border px-5 py-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <button className="rounded-md bg-[#30302f] px-4 py-2 text-sm font-medium text-white">Today</button>
          <button className="rounded-md border border-border px-3 py-2 text-sm">‹</button>
          <button className="rounded-md border border-border px-3 py-2 text-sm">›</button>
          <h2 className="text-lg font-semibold">Jul 6, 2026 - Jul 12, 2026</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/clients" className="rounded-md border border-border px-4 py-2 text-sm">Customers: {clientsCount}</Link>
          <Link href="/dashboard" className="rounded-md border border-border px-4 py-2 text-sm">Week</Link>
          <button onClick={() => setSlot({ day: "Today", time: "Next open time" })} className="rounded-md bg-[#30302f] px-4 py-2 text-sm font-medium text-white">Add appointment</button>
        </div>
      </div>

      <div className="grid grid-cols-2 border-b border-border bg-[#fbfaf7] text-sm sm:grid-cols-4">
        <div className="border-r border-border p-3"><strong>{openBookings}</strong><span className="ml-2 text-text-secondary">booking requests</span></div>
        <div className="border-r border-border p-3"><strong>{newConcierge}</strong><span className="ml-2 text-text-secondary">inbox alerts</span></div>
        <div className="border-r border-border p-3"><strong>{inventoryCount}</strong><span className="ml-2 text-text-secondary">inventory flags</span></div>
        <div className="p-3"><strong>Stripe</strong><span className="ml-2 text-text-secondary">ready to connect</span></div>
      </div>

      <div className="overflow-auto">
        <div className="min-w-[980px]">
          <div className="grid grid-cols-[72px_repeat(7,1fr)] border-b border-border bg-white text-center text-sm font-medium">
            <div className="border-r border-border p-3" />
            {week.map((day) => <div key={day} className="border-r border-border p-3 last:border-r-0">{day}</div>)}
          </div>
          <div className="relative grid grid-cols-[72px_repeat(7,1fr)]">
            <div className="bg-[#fbfaf7]">
              {times.map((time) => <div key={time} className="h-20 border-b border-r border-border p-2 text-right text-xs font-medium text-text-secondary">{time}</div>)}
            </div>
            {week.map((day) => (
              <div key={day} className="border-r border-border last:border-r-0">
                {times.map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setSlot({ day, time })}
                    className="block h-20 w-full border-b border-border bg-white text-left transition hover:bg-surface-elevated focus:bg-surface-elevated focus:outline-none"
                    aria-label={`Add appointment ${day} at ${time}`}
                  />
                ))}
              </div>
            ))}
            {appointments.map((appt) => (
              <button
                type="button"
                onClick={() => setSlot({ day: week[appt.day], time: times[appt.row] })}
                key={`${appt.day}-${appt.row}-${appt.client}`}
                className={`absolute rounded-md border border-black/10 p-2 text-left text-xs shadow-sm ${appt.color}`}
                style={{ left: `calc(72px + ((100% - 72px) / 7) * ${appt.day} + 8px)`, top: `${appt.row * 80 + 12}px`, width: "calc((100% - 72px) / 7 - 16px)", height: "64px" }}
              >
                <p className="font-semibold">{appt.title}</p>
                <p>{appt.client}</p>
                <p className="text-text-secondary">{appt.staff}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <Modal isOpen={Boolean(slot)} onClose={() => setSlot(null)} title={`Book ${slotTitle}`} size="lg">
        <div className="grid gap-4">
          <label className="grid gap-1 text-sm font-medium">
            Client
            <select className="rounded-md border border-border bg-white px-3 py-2.5 font-normal" value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)}>
              {clients.map((client) => <option key={client}>{client}</option>)}
            </select>
          </label>
          <label className="grid gap-1 text-sm font-medium">
            Service
            <select className="rounded-md border border-border bg-white px-3 py-2.5 font-normal" value={selectedService} onChange={(e) => setSelectedService(e.target.value)}>
              {services.map((service) => <option key={service}>{service}</option>)}
            </select>
          </label>
          <div>
            <p className="text-sm font-medium">Provider recommendations</p>
            <div className="mt-2 grid gap-2">
              {recommendations.map((recommendation) => (
                <label key={recommendation} className="flex gap-3 rounded-md border border-border bg-white p-3 text-sm text-text-secondary">
                  <input type="checkbox" checked={approvedRecommendations.has(recommendation)} onChange={() => toggleRecommendation(recommendation)} />
                  <span>{recommendation}</span>
                </label>
              ))}
            </div>
          </div>
          <label className="grid gap-1 text-sm font-medium">
            Promotion
            <select className="rounded-md border border-border bg-white px-3 py-2.5 font-normal">
              {promotions.map((promotion) => <option key={promotion}>{promotion}</option>)}
            </select>
          </label>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => setSlot(null)} className="rounded-md border border-border px-5 py-3 text-sm font-medium">Cancel</button>
            <button type="button" onClick={() => setSlot(null)} className="rounded-md bg-gradient-brand px-5 py-3 text-sm font-medium text-white">Save appointment</button>
          </div>
        </div>
      </Modal>
    </section>
  );
}
