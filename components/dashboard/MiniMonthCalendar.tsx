"use client";

import { useMemo, useState } from "react";

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function monthGrid(monthDate: Date) {
  const first = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}

function selectDate(date: Date, index: number) {
  window.dispatchEvent(new CustomEvent("bare-calendar-select-date", {
    detail: {
      iso: dateKey(date),
      label: `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`,
      day: date.getDate(),
      month: monthNames[date.getMonth()],
      year: date.getFullYear(),
      index,
    },
  }));
}

export default function MiniMonthCalendar() {
  const [monthDate, setMonthDate] = useState(() => new Date(2026, 6, 1));
  const todayKey = "2026-07-10";
  const days = useMemo(() => monthGrid(monthDate), [monthDate]);
  const title = `${monthNames[monthDate.getMonth()]} ${monthDate.getFullYear()}`;

  function moveMonth(direction: number) {
    setMonthDate((current) => new Date(current.getFullYear(), current.getMonth() + direction, 1));
  }

  return (
    <div className="mt-5 rounded-lg border border-border bg-white p-4">
      <div className="mb-3 flex items-center justify-between text-sm font-medium">
        <span>{title}</span>
        <div className="flex overflow-hidden rounded-md border border-border">
          <button type="button" onClick={() => moveMonth(-1)} className="px-2 py-1 hover:bg-surface-elevated" aria-label="Previous month">‹</button>
          <button type="button" onClick={() => moveMonth(1)} className="border-l border-border px-2 py-1 hover:bg-surface-elevated" aria-label="Next month">›</button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-text-muted">
        {["S", "M", "T", "W", "TH", "F", "S"].map((day) => <span key={day}>{day}</span>)}
        {days.map((date, index) => {
          const muted = date.getMonth() !== monthDate.getMonth();
          const today = dateKey(date) === todayKey;
          return (
            <button
              key={`${dateKey(date)}-${index}`}
              type="button"
              onClick={() => selectDate(date, index)}
              className={`rounded-full py-1 transition hover:bg-surface-elevated focus:outline-none focus:ring-2 focus:ring-[#30302f]/30 ${
                today ? "bg-[#30302f] text-white hover:bg-[#30302f]" : muted ? "text-text-muted/50" : "text-text-secondary"
              }`}
              aria-label={`View schedule for ${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
