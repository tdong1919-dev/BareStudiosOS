"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Modal from "@/components/ui/Modal";

const times = ["7 AM", "8 AM", "9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM", "7 PM", "8 PM", "9 PM", "10 PM", "11 PM", "12 AM", "1 AM", "2 AM", "3 AM", "4 AM", "5 AM", "6 AM", "7 AM"];
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const fallbackAppointments: CalendarAppointment[] = [
  { date: "2026-07-07", time: "8 AM", title: "Classic fill", client: "Jasmine R.", staff: "Na", color: "bg-[#d9eadf]" },
  { date: "2026-07-08", time: "10 AM", title: "Custom facial", client: "Sandra M.", staff: "Ciara", color: "bg-[#ead9c3]" },
  { date: "2026-07-10", time: "12 PM", title: "Barber consult", client: "John B.", staff: "Andy", color: "bg-[#d8e3ef]" },
  { date: "2026-07-12", time: "9 AM", title: "Lash lift + tint", client: "Maya L.", staff: "Ciara", color: "bg-[#eadce7]" },
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

type ViewMode = "day" | "week" | "month";

type SelectedDate = {
  iso?: string;
  label: string;
  day: number;
  month: string;
  year: number;
  index?: number;
};

export type CalendarAppointment = {
  date: string;
  time?: string;
  title: string;
  client: string;
  staff?: string;
  color?: string;
};

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function parseDateKey(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

function labelForDate(date: Date) {
  return `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

function selectedFromDate(date: Date): SelectedDate {
  return {
    iso: dateKey(date),
    label: labelForDate(date),
    day: date.getDate(),
    month: monthNames[date.getMonth()],
    year: date.getFullYear(),
  };
}

function startOfWeek(date: Date) {
  const start = new Date(date);
  start.setDate(date.getDate() - date.getDay());
  return start;
}

function weekDates(date: Date) {
  const start = startOfWeek(date);
  return Array.from({ length: 7 }, (_, index) => {
    const next = new Date(start);
    next.setDate(start.getDate() + index);
    return next;
  });
}

function monthGrid(date: Date) {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const start = startOfWeek(first);
  return Array.from({ length: 42 }, (_, index) => {
    const next = new Date(start);
    next.setDate(start.getDate() + index);
    return next;
  });
}

function timeRow(time?: string) {
  const index = times.indexOf(time || "");
  return index >= 0 ? index : 3;
}

export default function InteractiveCalendar({
  clientsCount,
  openBookings,
  newConcierge,
  inventoryCount,
  historyAppointments = [],
}: {
  clientsCount: number;
  openBookings: number;
  newConcierge: number;
  inventoryCount: number;
  historyAppointments?: CalendarAppointment[];
}) {
  const [slot, setSlot] = useState<Slot | null>(null);
  const [selectedClient, setSelectedClient] = useState(clients[0]);
  const [selectedService, setSelectedService] = useState(services[0]);
  const [approvedRecommendations, setApprovedRecommendations] = useState(() => new Set(recommendations));
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [selectedDate, setSelectedDate] = useState<SelectedDate>(() => selectedFromDate(new Date(2026, 6, 10)));
  const selectedDateObj = useMemo(() => parseDateKey(selectedDate.iso || "2026-07-10"), [selectedDate.iso]);
  const monthDate = new Date(selectedDateObj.getFullYear(), selectedDateObj.getMonth(), 1);
  const appointments = historyAppointments.length > 0 ? historyAppointments : fallbackAppointments;
  const appointmentClients = useMemo(() => {
    const names = appointments.map((appt) => appt.client).filter(Boolean);
    return Array.from(new Set([...names, ...clients]));
  }, [appointments]);
  const slotTitle = useMemo(() => slot ? `${slot.day} at ${slot.time}` : "New appointment", [slot]);
  const currentWeek = useMemo(() => weekDates(selectedDateObj), [selectedDateObj]);
  const visibleDays = viewMode === "day" ? [selectedDateObj] : currentWeek;
  const calendarTitle = viewMode === "month"
    ? `${monthNames[monthDate.getMonth()]} ${monthDate.getFullYear()}`
    : viewMode === "day"
      ? labelForDate(selectedDateObj)
      : `${labelForDate(currentWeek[0])} - ${labelForDate(currentWeek[6])}`;

  useEffect(() => {
    function selectFromMiniCalendar(event: Event) {
      const detail = (event as CustomEvent<SelectedDate>).detail;
      if (!detail?.iso) return;
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

  function movePeriod(direction: number) {
    const next = new Date(selectedDateObj);
    if (viewMode === "day") next.setDate(next.getDate() + direction);
    if (viewMode === "week") next.setDate(next.getDate() + direction * 7);
    if (viewMode === "month") next.setMonth(next.getMonth() + direction);
    setSelectedDate(selectedFromDate(next));
  }

  function today() {
    setSelectedDate(selectedFromDate(new Date(2026, 6, 10)));
    setViewMode("day");
  }

  const appointmentsForDate = (date: Date) => appointments.filter((appt) => appt.date === dateKey(date));

  return (
    <section className="overflow-hidden bg-white">
      <div className="flex flex-col gap-3 border-b border-border px-5 py-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={today} className="rounded-md bg-[#30302f] px-4 py-2 text-sm font-medium text-white">Today</button>
          <button type="button" onClick={() => movePeriod(-1)} className="rounded-md border border-border px-3 py-2 text-sm">‹</button>
          <button type="button" onClick={() => movePeriod(1)} className="rounded-md border border-border px-3 py-2 text-sm">›</button>
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
          <button onClick={() => setSlot({ day: labelForDate(selectedDateObj), time: "Next open time" })} className="rounded-md bg-[#30302f] px-4 py-2 text-sm font-medium text-white">Add appointment</button>
        </div>
      </div>

      <div className="grid grid-cols-2 border-b border-border bg-[#fbfaf7] text-sm sm:grid-cols-4">
        <div className="border-r border-border p-3"><strong>{openBookings}</strong><span className="ml-2 text-text-secondary">booking requests</span></div>
        <div className="border-r border-border p-3"><strong>{newConcierge}</strong><span className="ml-2 text-text-secondary">inbox alerts</span></div>
        <div className="border-r border-border p-3"><strong>{inventoryCount}</strong><span className="ml-2 text-text-secondary">inventory flags</span></div>
        <div className="p-3"><strong>{historyAppointments.length}</strong><span className="ml-2 text-text-secondary">imported appointment history</span></div>
      </div>

      <div className="overflow-auto">
        <div className="min-w-[980px]">
          {viewMode === "month" ? (
            <div className="grid grid-cols-7 border-l border-t border-border">
              {weekdayNames.map((day) => (
                <div key={day} className="border-b border-r border-border bg-[#fbfaf7] p-3 text-center text-sm font-medium">{day}</div>
              ))}
              {monthGrid(monthDate).map((date) => {
                const muted = date.getMonth() !== monthDate.getMonth();
                const dayAppointments = appointmentsForDate(date).slice(0, 3);
                return (
                  <button
                    key={dateKey(date)}
                    type="button"
                    onClick={() => {
                      setSelectedDate(selectedFromDate(date));
                      setViewMode("day");
                    }}
                    className={`min-h-32 border-b border-r border-border p-3 text-left transition hover:bg-surface-elevated focus:bg-surface-elevated focus:outline-none ${muted ? "text-text-muted/50" : ""}`}
                  >
                    <span className="text-sm font-medium">{date.getDate()}</span>
                    <div className="mt-3 grid gap-1">
                      {dayAppointments.map((appt, index) => (
                        <span key={`${appt.client}-${index}`} className={`block truncate rounded-md p-1.5 text-xs text-text-primary ${appt.color || "bg-[#ead9c3]"}`}>
                          {appt.title}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <>
              <div className={`grid border-b border-border bg-white text-center text-sm font-medium ${viewMode === "day" ? "grid-cols-[72px_1fr]" : "grid-cols-[72px_repeat(7,1fr)]"}`}>
                <div className="border-r border-border p-3" />
                {visibleDays.map((date) => (
                  <button
                    key={dateKey(date)}
                    type="button"
                    onClick={() => {
                      setSelectedDate(selectedFromDate(date));
                      setViewMode("day");
                    }}
                    className="border-r border-border p-3 transition hover:bg-surface-elevated focus:bg-surface-elevated focus:outline-none last:border-r-0"
                    aria-label={`View schedule for ${labelForDate(date)}`}
                  >
                    {viewMode === "day" ? labelForDate(date) : `${weekdayNames[date.getDay()]} ${date.getDate()}`}
                  </button>
                ))}
              </div>
              <div className={`relative grid ${viewMode === "day" ? "grid-cols-[72px_1fr]" : "grid-cols-[72px_repeat(7,1fr)]"}`}>
                <div className="bg-[#fbfaf7]">
                  {times.map((time) => <div key={time} className="h-20 border-b border-r border-border p-2 text-right text-xs font-medium text-text-secondary">{time}</div>)}
                </div>
                {visibleDays.map((date) => (
                  <div key={dateKey(date)} className="border-r border-border last:border-r-0">
                    {times.map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setSlot({ day: labelForDate(date), time })}
                        className="block h-20 w-full border-b border-border bg-white text-left transition hover:bg-surface-elevated focus:bg-surface-elevated focus:outline-none"
                        aria-label={`Add appointment ${labelForDate(date)} at ${time}`}
                      />
                    ))}
                  </div>
                ))}
                {visibleDays.flatMap((date, dayIndex) => appointmentsForDate(date).map((appt, apptIndex) => {
                  const row = timeRow(appt.time);
                  const left = viewMode === "day" ? "88px" : `calc(72px + ((100% - 72px) / 7) * ${dayIndex} + 8px)`;
                  const width = viewMode === "day" ? "calc(100% - 104px)" : "calc((100% - 72px) / 7 - 16px)";
                  return (
                    <button
                      type="button"
                      onClick={() => setSlot({ day: labelForDate(date), time: appt.time || times[row] })}
                      key={`${appt.date}-${appt.client}-${apptIndex}`}
                      className={`absolute rounded-md border border-black/10 p-2 text-left text-xs shadow-sm ${appt.color || "bg-[#ead9c3]"}`}
                      style={{ left, top: `${row * 80 + 12 + apptIndex * 8}px`, width, height: "64px" }}
                    >
                      <p className="font-semibold">{appt.title}</p>
                      <p>{appt.client}</p>
                      <p className="text-text-secondary">{appt.staff || "Imported"}</p>
                    </button>
                  );
                }))}
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
              {appointmentClients.map((client) => <option key={client}>{client}</option>)}
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
