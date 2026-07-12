"use client";

const days = [28, 29, 30, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 1];

function openAppointment(day: number, index: number) {
  const month = index < 3 ? "June" : index > 33 ? "August" : "July";
  window.dispatchEvent(new CustomEvent("bare-calendar-open-slot", {
    detail: { day: `${month} ${day}`, time: "Select time" },
  }));
}

export default function MiniMonthCalendar() {
  return (
    <div className="mt-5 rounded-lg border border-border bg-white p-4">
      <div className="mb-3 flex items-center justify-between text-sm font-medium">
        <span>July 2026</span>
        <span>‹ ›</span>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-text-muted">
        {["S", "M", "T", "W", "TH", "F", "S"].map((day) => <span key={day}>{day}</span>)}
        {days.map((day, index) => {
          const muted = index < 3 || index > 33;
          const today = day === 10 && !muted;
          return (
            <button
              key={`${day}-${index}`}
              type="button"
              onClick={() => openAppointment(day, index)}
              className={`rounded-full py-1 transition hover:bg-surface-elevated focus:outline-none focus:ring-2 focus:ring-[#30302f]/30 ${
                today ? "bg-[#30302f] text-white hover:bg-[#30302f]" : muted ? "text-text-muted/50" : "text-text-secondary"
              }`}
              aria-label={`Add appointment on ${muted && index < 3 ? "June" : muted ? "August" : "July"} ${day}`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
