"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Modal from "@/components/ui/Modal";

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
const monthRows = [
  ["June 28", "June 29", "June 30", "July 1", "July 2", "July 3", "July 4"],
  ["July 5", "July 6", "July 7", "July 8", "July 9", "July 10", "July 11"],
  ["July 12", "July 13", "July 14", "July 15", "July 16", "July 17", "July 18"],
  ["July 19", "July 20", "July 21", "July 22", "July 23", "July 24", "July 25"],
  ["July 26", "July 27", "July 28", "July 29", "July 30", "July 31", "August 1"],
];

type Slot = {
  day: string;
  time: string;
};

type ViewMode = "day" | "week" | "month";

type SelectedDate = {
  label: string;
  day: number;
  month: string;
  index: number;
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
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [selectedDate, setSelectedDate] = useState<SelectedDate>({ label: "July 10", day: 10, month: "July", index: 12 });
  const slotTitle = useMemo(() => slot ? `${slot.day} at ${slot.time}` : "New appointment", [slot]);
  const selectedWeekStart = Math.floor(selectedDate.index / 7) * 7;
  const visibleWeek = useMemo(() => {
    const flat = monthRows.flat();
    return flat.slice(selectedWeekStart, selectedWeekStart + 7).map((label) => {
      const [month, day] = label.split(" ");
      const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][flat.indexOf(label) % 7];
      return `${weekday} ${Number(day)}${month !== "July" ? ` (${month})` : ""}`;
    });
  }, [selectedWeekStart]);
  const visibleDays = viewMode === "day" ? [selectedDate.label] : visibleWeek;
  const calendarTitle = viewMode === "month"
    ? "July 2026"
    : viewMode === "day"
      ? selectedDate.label
      : `${visibleWeek[0]} - ${visibleWeek[visibleWeek.length - 1]}`;

  function openDay(day: string) {
    setSlot({ day, time: "Select time" });
  }

  useEffect(() => {
    function selectFromMiniCalendar(event: Event) {
      const detail = (event as CustomEvent<SelectedDate>).detail;
      if (!detail?.label) return;
      setSelectedDate(detail);
      setViewMode("day");
    }

    window.addEventListener("bare-calendar-select-date", selectFromMiniCalendar);
    return () => window.removeEventListener("bare-calendar-select-date", selectFromMiniCalendar);
  }, []);

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
          <button
            type="button"
            onClick={() => {
              setSelectedDate({ label: "July 10", day: 10, month: "July", index: 12 });
              setViewMode("day");
            }}
            className="rounded-md bg-[#30302f] px-4 py-2 text-sm font-medium text-white"
          >
            Today
          </button>
          <button className="rounded-md border border-border px-3 py-2 text-sm">‹</button>
          <button className="rounded-md border border-border px-3 py-2 text-sm">›</button>
          <h2 className="text-lg font-semibold">{calendarTitle}</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/clients" className="rounded-md border border-border px-4 py-2 text-sm">Customers: {clientsCount}</Link>
          <div className="flex overflow-hidden rounded-md border border-border">
            {(["day", "week", "month"] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                className={`px-4 py-2 text-sm capitalize transition ${viewMode === mode ? "bg-[#30302f] text-white" : "bg-white hover:bg-surface-elevated"}`}
              >
                {mode}
              </button>
            ))}
          </div>
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
          {viewMode === "month" ? (
            <div className="grid grid-cols-7 border-l border-t border-border">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="border-b border-r border-border bg-[#fbfaf7] p-3 text-center text-sm font-medium">{day}</div>
              ))}
              {monthRows.flat().map((label, index) => {
                const muted = !label.startsWith("July");
                const hasAppt = appointments.some((appt) => appt.day === index % 7 && Math.floor(index / 7) === 1);
                return (
                  <button
                    key={`${label}-${index}`}
                    type="button"
                    onClick={() => {
                      const [month, day] = label.split(" ");
                      setSelectedDate({ label, month, day: Number(day), index });
                      setViewMode("day");
                    }}
                    className={`min-h-32 border-b border-r border-border p-3 text-left transition hover:bg-surface-elevated focus:bg-surface-elevated focus:outline-none ${muted ? "text-text-muted/50" : ""}`}
                  >
                    <span className="text-sm font-medium">{label.replace("July ", "")}</span>
                    {hasAppt && <span className="mt-4 block rounded-md bg-[#ead9c3] p-2 text-xs text-text-primary">Appointments scheduled</span>}
                  </button>
                );
              })}
            </div>
          ) : (
            <>
              <div className={`grid border-b border-border bg-white text-center text-sm font-medium ${viewMode === "day" ? "grid-cols-[72px_1fr]" : "grid-cols-[72px_repeat(7,1fr)]"}`}>
                <div className="border-r border-border p-3" />
                {visibleDays.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => openDay(day)}
                    className="border-r border-border p-3 transition hover:bg-surface-elevated focus:bg-surface-elevated focus:outline-none last:border-r-0"
                    aria-label={`View schedule for ${day}`}
                  >
                    {day}
                  </button>
                ))}
              </div>
              <div className={`relative grid ${viewMode === "day" ? "grid-cols-[72px_1fr]" : "grid-cols-[72px_repeat(7,1fr)]"}`}>
                <div className="bg-[#fbfaf7]">
                  {times.map((time) => <div key={time} className="h-20 border-b border-r border-border p-2 text-right text-xs font-medium text-text-secondary">{time}</div>)}
                </div>
                {visibleDays.map((day) => (
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
                {viewMode === "week" && appointments.map((appt) => (
                  <button
                    type="button"
                    onClick={() => setSlot({ day: visibleWeek[appt.day], time: times[appt.row] })}
                    key={`${appt.day}-${appt.row}-${appt.client}`}
                    className={`absolute rounded-md border border-black/10 p-2 text-left text-xs shadow-sm ${appt.color}`}
                    style={{ left: `calc(72px + ((100% - 72px) / 7) * ${appt.day} + 8px)`, top: `${appt.row * 80 + 12}px`, width: "calc((100% - 72px) / 7 - 16px)", height: "64px" }}
                  >
                    <p className="font-semibold">{appt.title}</p>
                    <p>{appt.client}</p>
                    <p className="text-text-secondary">{appt.staff}</p>
                  </button>
                ))}
                {viewMode === "day" && appointments.filter((appt) => visibleWeek[appt.day]?.includes(String(selectedDate.day))).map((appt) => (
                  <button
                    type="button"
                    onClick={() => setSlot({ day: selectedDate.label, time: times[appt.row] })}
                    key={`${appt.day}-${appt.row}-${appt.client}`}
                    className={`absolute left-[88px] right-4 rounded-md border border-black/10 p-2 text-left text-xs shadow-sm ${appt.color}`}
                    style={{ top: `${appt.row * 80 + 12}px`, height: "64px" }}
                  >
                    <p className="font-semibold">{appt.title}</p>
                    <p>{appt.client}</p>
                    <p className="text-text-secondary">{appt.staff}</p>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <Modal isOpen={Boolean(slot)} onClose={() => setSlot(null)} title={`Book ${slotTitle}`} size="lg">
        <div className="grid gap-4">
          <label className="grid gap-1 text-sm font-medium">
            Time
            <select
              className="rounded-md border border-border bg-white px-3 py-2.5 font-normal"
              value={slot?.time && times.includes(slot.time) ? slot.time : ""}
              onChange={(e) => slot && setSlot({ ...slot, time: e.target.value || "Select time" })}
            >
              <option value="">Select time</option>
              {times.map((time, index) => <option key={`${time}-${index}`} value={time}>{time}</option>)}
            </select>
          </label>
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
