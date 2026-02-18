import React, { useMemo, useState } from "react";
import { MdChevronLeft, MdChevronRight, MdCalendarMonth, MdViewWeek, MdList, MdDownload, MdAdd } from "react-icons/md";

const COLORS = {
  text: "#E6E8F0",
  text2: "#A3A7B7",
  card: "#161821",
  ring: "rgba(110,86,207,0.25)",
  gold: "#D4AF37",
  purple: "#6E56CF",
};

const startOfWeek = (d) => {
  const date = new Date(d);
  const day = (date.getDay() + 6) % 7; // Mon=0
  date.setDate(date.getDate() - day);
  date.setHours(0, 0, 0, 0);
  return date;
};

const sameDay = (a, b) =>
  new Date(a).toDateString() === new Date(b).toDateString();

const fmtHM = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const hh = d.getHours().toString().padStart(2, "0");
  const mm = d.getMinutes().toString().padStart(2, "0");
  return `${hh}:${mm}`;
};

const dayLabel = (d) =>
  d.toLocaleDateString(undefined, { month: "short", day: "numeric" });

const monthLabel = (d) =>
  d.toLocaleDateString(undefined, { month: "long", year: "numeric" });

const EventPill = ({ ev, onClick }) => (
  <button
    onClick={() => onClick?.(ev)}
    className="w-full text-left px-2 py-1 rounded-lg text-xs font-semibold truncate"
    style={{
      backgroundColor: "rgba(255,255,255,0.06)",
      border: `1px solid ${COLORS.ring}`,
      color: COLORS.text,
    }}
    title={ev.title}
  >
    {fmtHM(ev.start)} • {ev.title}
  </button>
);

const LiveCalendar = ({ events = [], onCreate, onSelect, onEdit, onExport }) => {
  const [view, setView] = useState("month"); // month | week | list
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const monthMatrix = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const start = startOfWeek(first);
    const weeks = [];
    for (let w = 0; w < 6; w++) {
      const days = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + w * 7 + i);
        days.push(d);
      }
      weeks.push(days);
    }
    return weeks;
  }, [cursor]);

  const weekDays = useMemo(() => {
    const start = startOfWeek(cursor);
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [cursor]);

  const monthEvents = (d) =>
    events.filter((e) => sameDay(e.start, d));

  const weekEventsByDay = useMemo(() => {
    const map = new Map();
    weekDays.forEach((d) => map.set(d.toDateString(), []));
    events.forEach((e) => {
      weekDays.forEach((d) => {
        if (sameDay(e.start, d)) {
          map.get(d.toDateString()).push(e);
        }
      });
    });
    return map;
  }, [events, weekDays]);

  const listRows = useMemo(() => {
    const start = new Date(cursor);
    const end = new Date(cursor);
    if (view === "list") {
      // 30-day window around cursor month
      start.setDate(1);
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
    }
    return [...events]
      .filter((e) => (view === "list" ? new Date(e.start) >= start && new Date(e.start) <= end : true))
      .sort((a, b) => new Date(a.start) - new Date(b.start));
  }, [events, cursor, view]);

  const gotoPrev = () => {
    const d = new Date(cursor);
    if (view === "month" || view === "list") d.setMonth(d.getMonth() - 1);
    else d.setDate(d.getDate() - 7);
    setCursor(d);
  };
  const gotoNext = () => {
    const d = new Date(cursor);
    if (view === "month" || view === "list") d.setMonth(d.getMonth() + 1);
    else d.setDate(d.getDate() + 7);
    setCursor(d);
  };
  const gotoToday = () => setCursor(new Date());

  return (
    <div className="rounded-2xl p-3 sm:p-4"
         style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.ring}` }}>
      {/* Header Row */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <button
            className="h-9 w-9 grid place-items-center rounded-lg"
            style={{ backgroundColor: "#12131A", border: `1px solid ${COLORS.ring}`, color: COLORS.text }}
            onClick={gotoPrev}
            aria-label="Previous"
          >
            <MdChevronLeft />
          </button>
          <button
            className="h-9 w-9 grid place-items-center rounded-lg"
            style={{ backgroundColor: "#12131A", border: `1px solid ${COLORS.ring}`, color: COLORS.text }}
            onClick={gotoNext}
            aria-label="Next"
          >
            <MdChevronRight />
          </button>
          <div className="text-sm font-semibold ml-1" style={{ color: COLORS.text }}>
            {view === "month" || view === "list" ? monthLabel(cursor) : `${dayLabel(startOfWeek(cursor))} – ${dayLabel(new Date(startOfWeek(cursor).getTime()+6*86400000))}`}
          </div>
          <button
            className="ml-2 h-8 px-2 text-xs rounded-lg"
            style={{ backgroundColor: "#12131A", border: `1px solid ${COLORS.ring}`, color: COLORS.text2 }}
            onClick={gotoToday}
          >
            Today
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1">
            {[
              { key: "month", Icon: MdCalendarMonth, label: "Month" },
              { key: "week", Icon: MdViewWeek, label: "Week" },
              { key: "list", Icon: MdList, label: "List" },
            ].map(({ key, label }) => {
              const active = view === key;
              return (
                <button
                  key={key}
                  onClick={() => setView(key)}
                  className="px-3 h-9 rounded-lg text-sm font-medium inline-flex items-center gap-1"
                  style={{
                    background: active ? `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.purple})` : "transparent",
                    color: active ? "#0B0B0F" : COLORS.text2,
                    border: active ? "none" : `1px solid ${COLORS.ring}`,
                  }}
                >
                  <Icon size={16} /> {label}
                </button>
              );
            })}
          </div>

          <button
            className="h-9 px-3 rounded-lg text-sm font-medium inline-flex items-center gap-2"
            style={{ backgroundColor: "#12131A", border: `1px solid ${COLORS.ring}`, color: COLORS.text }}
            onClick={() => onExport?.()}
            title="Export CSV"
          >
            <MdDownload /> Export
          </button>

          <button
            className="h-9 px-3 rounded-lg text-sm font-medium inline-flex items-center gap-2"
            style={{ background: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.purple})`, color: "#0B0B0F" }}
            onClick={() => onCreate?.()}
          >
            <MdAdd /> New
          </button>
        </div>
      </div>

      {/* Views */}
      {view === "month" && (
        <div className="mt-4 grid grid-cols-7 gap-px rounded-xl overflow-hidden"
             style={{ backgroundColor: COLORS.ring }}>
          {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d) => (
            <div key={d} className="px-2 py-2 text-xs font-semibold"
                 style={{ backgroundColor: "#0F1118", color: COLORS.text2 }}>
              {d}
            </div>
          ))}
          {monthMatrix.map((week, wi) =>
            week.map((d, di) => {
              const inMonth = d.getMonth() === cursor.getMonth();
              const today = sameDay(d, new Date());
              const dayEvents = monthEvents(d);
              return (
                <div key={`${wi}-${di}`} className="min-h-[100px] p-2 space-y-2"
                     style={{
                       backgroundColor: inMonth ? "#12131A" : "#0F1118",
                       borderTop: `1px solid ${COLORS.ring}`,
                       color: COLORS.text,
                     }}>
                  <div className="flex items-center justify-between text-xs">
                    <span style={{ color: inMonth ? COLORS.text2 : "#667085" }}>{d.getDate()}</span>
                    {today && (
                      <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold"
                            style={{ backgroundColor: "rgba(255,255,255,0.06)", border: `1px solid ${COLORS.ring}`, color: COLORS.text2 }}>
                        Today
                      </span>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    {dayEvents.slice(0,3).map((ev) => (
                      <EventPill key={ev.id} ev={ev} onClick={onSelect} />
                    ))}
                    {dayEvents.length > 3 && (
                      <button
                        onClick={() => onCreate?.(new Date(d).toISOString().slice(0,16))}
                        className="w-full text-left px-2 py-1 rounded-lg text-[11px]"
                        style={{ backgroundColor: "rgba(255,255,255,0.03)", color: COLORS.text2, border: `1px solid ${COLORS.ring}` }}
                      >
                        + {dayEvents.length - 3} more…
                      </button>
                    )}
                    {dayEvents.length === 0 && (
                      <button
                        onClick={() => onCreate?.(new Date(d).toISOString().slice(0,16))}
                        className="w-full text-left px-2 py-6 rounded-lg text-xs"
                        style={{ backgroundColor: "rgba(255,255,255,0.02)", color: COLORS.text2, border: `1px dashed ${COLORS.ring}` }}
                      >
                        + Add
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {view === "week" && (
        <div className="mt-4">
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((d) => (
              <div key={d.toISOString()}>
                <div className="text-xs font-semibold mb-2" style={{ color: COLORS.text2 }}>
                  {d.toLocaleDateString(undefined, { weekday: "short" })} • {d.getDate()}
                </div>
                <div className="space-y-2">
                  {(weekEventsByDay.get(d.toDateString()) || []).map((ev) => (
                    <div key={ev.id}
                         className="p-2 rounded-lg space-y-1"
                         style={{ backgroundColor: "#12131A", border: `1px solid ${COLORS.ring}`, color: COLORS.text }}>
                      <div className="text-xs font-semibold truncate">{fmtHM(ev.start)}–{fmtHM(ev.end)} • {ev.title}</div>
                      <div className="text-[11px]" style={{ color: COLORS.text2 }}>
                        {ev.mode === "virtual" ? "Virtual" : ev.location || "In-person"} • {ev.category}
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          className="px-2 py-1 rounded-md text-[11px] font-semibold"
                          style={{ backgroundColor: "#0F1118", border: `1px solid ${COLORS.ring}`, color: COLORS.text2 }}
                          onClick={() => onSelect?.(ev)}
                        >
                          Details
                        </button>
                        <button
                          className="px-2 py-1 rounded-md text-[11px] font-semibold"
                          style={{ background: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.purple})`, color: "#0B0B0F" }}
                          onClick={() => onEdit?.(ev)}
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => onCreate?.(d.toISOString().slice(0,16))}
                    className="w-full px-2 py-6 rounded-lg text-xs"
                    style={{ backgroundColor: "rgba(255,255,255,0.02)", color: COLORS.text2, border: `1px dashed ${COLORS.ring}` }}
                  >
                    + Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === "list" && (
        <div className="mt-4 rounded-xl overflow-hidden">
          <table className="min-w-[1000px] w-full text-sm">
            <thead>
              <tr className="sticky top-0 z-10"
                  style={{ backgroundColor: "#0F1118", color: COLORS.text2, borderBottom: `1px solid ${COLORS.ring}` }}>
                <th className="py-3 px-3 text-left">When</th>
                <th className="py-3 text-left">Title</th>
                <th className="py-3 text-left">Category</th>
                <th className="py-3 text-left">Mode</th>
                <th className="py-3 text-left">Host</th>
                <th className="py-3 text-left">Status</th>
                <th className="py-3 text-left">Capacity</th>
                <th className="py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {listRows.map((ev, i) => (
                <tr key={ev.id}
                    className={`transition-colors ${i % 2 ? "bg-[#131522]" : ""} hover:bg-[#1A1C26]`}
                    style={{ color: COLORS.text, borderBottom: `1px solid ${COLORS.ring}` }}>
                  <td className="py-3 px-3" style={{ color: COLORS.text2 }}>
                    {new Date(ev.start).toLocaleString()} — {fmtHM(ev.end)}
                  </td>
                  <td className="py-3">{ev.title}</td>
                  <td className="py-3" style={{ color: COLORS.text2 }}>{ev.category}</td>
                  <td className="py-3" style={{ color: COLORS.text2 }}>
                    {ev.mode === "virtual" ? "Virtual" : "In-person"}
                  </td>
                  <td className="py-3" style={{ color: COLORS.text2 }}>{ev.host}</td>
                  <td className="py-3">
                    <span
                      className="px-2 py-0.5 rounded-md text-[11px] font-semibold"
                      style={{
                        backgroundColor:
                          ev.status === "Live" ? "rgba(34,197,94,0.15)" :
                          ev.status === "Ended" ? "rgba(163,167,183,0.15)" : "rgba(245,158,11,0.15)",
                        color:
                          ev.status === "Live" ? "#22C55E" :
                          ev.status === "Ended" ? "#A3A7B7" : "#F59E0B",
                      }}
                    >
                      {ev.status}
                    </span>
                  </td>
                  <td className="py-3" style={{ color: COLORS.text2 }}>{ev.capacity}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <button
                        className="px-2.5 py-1.5 rounded-md text-xs font-semibold"
                        style={{ backgroundColor: "#12131A", border: `1px solid ${COLORS.ring}`, color: COLORS.text }}
                        onClick={() => onSelect?.(ev)}
                      >
                        Details
                      </button>
                      <button
                        className="px-2.5 py-1.5 rounded-md text-xs font-semibold"
                        style={{ background: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.purple})`, color: "#0B0B0F" }}
                        onClick={() => onEdit?.(ev)}
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!listRows.length && (
                <tr>
                  <td colSpan={8} className="py-10 text-center" style={{ color: COLORS.text2 }}>
                    No sessions or events this month.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LiveCalendar;
