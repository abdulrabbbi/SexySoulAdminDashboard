import React, {  useState } from "react";
import LiveCalendar from "../Components/live/LiveCalendar";
import EventDrawer from "../Components/live/EventDrawer";
import EventDetails from "../Components/live/EventDetails";
import { useNavigate } from "react-router-dom";

const COLORS = {
  text: "#E6E8F0",
  text2: "#A3A7B7",
  card: "#161821",
  ring: "rgba(110,86,207,0.25)",
  gold: "#D4AF37",
  purple: "#6E56CF",
};

/** ---- Mock seed events ---- */
const SEED_EVENTS = [
  {
    id: "ev_1001",
    title: "Live: Real Estate AMA",
    type: "live", // live | event
    category: "Real Estate",
    mode: "virtual", // virtual | in-person
    host: "Russell Davis",
    tiers: ["Paid", "VIP"],
    capacity: 500,
    tickets: [{ name: "Standard", price: 0 }],
    chatEnabled: true,
    qnaEnabled: true,
    recordEnabled: true,
    reminders: ["24h", "1h"],
    rtmpUrl: "rtmp://stream.example/ssl/room-1001",
    joinUrl: "https://zoom.us/j/123456789",
    location: "",
    description:
      "Bring your questions on your first rental, cap rates & financing.",
    start: "2025-08-24T15:00:00", // local ISO (Asia/Karachi per your app)
    end: "2025-08-24T16:00:00",
    status: "Scheduled", // Scheduled | Live | Ended
    replayUrl: "",
    attendees: [
      {
        id: "u_1",
        name: "Alex Benjamin",
        email: "alex@example.com",
        checkedIn: false,
      },
      {
        id: "u_2",
        name: "Jane Smith",
        email: "jane@example.com",
        checkedIn: true,
      },
    ],
    participants: [
      { id: "p_1", name: "Alex Benjamin" },
      { id: "p_2", name: "Jane Smith" },
    ],
    metrics: {
      registrants: 220,
      attendees: 146,
      avgWatchMins: 28,
      chatMessages: 312,
    },
  },
  {
    id: "ev_1002",
    title: "VIP Mixer – Dubai",
    type: "event",
    category: "Acting & Entertainment",
    mode: "in-person",
    host: "Calvin Richardson",
    tiers: ["VIP"],
    capacity: 120,
    tickets: [{ name: "VIP", price: 0 }],
    chatEnabled: false,
    qnaEnabled: false,
    recordEnabled: false,
    reminders: ["72h", "24h"],
    rtmpUrl: "",
    joinUrl: "",
    location: "Four Seasons DIFC, Dubai",
    description: "Invite-only mixer, bring your business cards.",
    start: "2025-08-28T19:00:00",
    end: "2025-08-28T22:00:00",
    status: "Scheduled",
    replayUrl: "",
    attendees: [
      {
        id: "u_9",
        name: "Jerry Maguire",
        email: "jerry@example.com",
        checkedIn: false,
      },
    ],
    participants: [],
    metrics: {
      registrants: 98,
      attendees: 0,
      avgWatchMins: 0,
      chatMessages: 0,
    },
  },
  {
    id: "ev_1003",
    title: "Finance Power Hour (Replay Ready)",
    type: "live",
    category: "Finance",
    mode: "virtual",
    host: "Sunil G.",
    tiers: ["Paid", "VIP"],
    capacity: 1000,
    tickets: [{ name: "General", price: 0 }],
    chatEnabled: true,
    qnaEnabled: true,
    recordEnabled: true,
    reminders: ["24h", "1h"],
    rtmpUrl: "rtmp://stream.example/ssl/room-1003",
    joinUrl: "https://zoom.us/j/987654321",
    location: "",
    description: "High-yield strategies and capital allocation Q&A.",
    start: "2025-08-15T17:00:00",
    end: "2025-08-15T18:00:00",
    status: "Ended",
    replayUrl: "https://cdn.example.com/replays/ev_1003.mp4",
    attendees: [],
    participants: [],
    metrics: {
      registrants: 540,
      attendees: 410,
      avgWatchMins: 34,
      chatMessages: 820,
    },
  },
];

const LiveEventsPage = () => {
  const [events, setEvents] = useState(SEED_EVENTS);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [active, setActive] = useState(null); // for details
  const navigate = useNavigate();

  const onCreate = (presetDateTime) => {
    setEditing(
      presetDateTime ? { start: presetDateTime, end: presetDateTime } : null
    );
    setDrawerOpen(true);
  };

  const onEdit = (ev) => {
    setEditing(ev);
    setDrawerOpen(true);
  };

  const upsert = (record) => {
    setEvents((prev) => {
      const exists = prev.some((e) => e.id === record.id);
      if (exists) return prev.map((e) => (e.id === record.id ? record : e));
      const newId = `ev_${Math.floor(Math.random() * 9000) + 1000}`;
      return [{ ...record, id: newId }, ...prev];
    });
    setDrawerOpen(false);
  };

  const onExport = (rows) => {
    const headers = [
      "ID",
      "Title",
      "Type",
      "Category",
      "Mode",
      "Host",
      "Tiers",
      "Capacity",
      "Start",
      "End",
      "Status",
      "RTMP",
      "Join",
      "Location",
      "Registrants",
      "Attendees",
      "AvgWatchMins",
      "ChatMsgs",
    ];
    const source = rows?.length ? rows : events;
    const lines = source.map((r) => [
      r.id,
      r.title,
      r.type,
      r.category,
      r.mode,
      r.host,
      (r.tiers || []).join("|"),
      r.capacity,
      r.start,
      r.end,
      r.status,
      r.rtmpUrl,
      r.joinUrl,
      r.location,
      r.metrics?.registrants || 0,
      r.metrics?.attendees || 0,
      r.metrics?.avgWatchMins || 0,
      r.metrics?.chatMessages || 0,
    ]);
    const csv = [headers, ...lines]
      .map((row) =>
        row.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `live_events_export_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const setStatus = (id, status) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
  };

  const saveReplay = (id, replayUrl) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, replayUrl } : e))
    );
  };

  const updateAttendeeCheckin = (id, attendeeId, checkedIn) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id !== id
          ? e
          : {
              ...e,
              attendees: (e.attendees || []).map((a) =>
                a.id === attendeeId ? { ...a, checkedIn } : a
              ),
            }
      )
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1
          className="text-xl md:text-2xl font-semibold"
          style={{ color: COLORS.text }}
        >
          Live & Events
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/live-studio")}
            className="px-3 py-2 rounded-xl text-sm font-medium"
            style={{
              background: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.purple})`,
              color: "#0B0B0F",
            }}
          >
            Go Live
          </button>

          <button
            onClick={() => onCreate()}
            className="px-3 py-2 rounded-xl text-sm font-medium"
            style={{
              background:
                "linear-gradient(90deg, rgba(230,232,240,0.1), rgba(230,232,240,0.08))",
              border: "1px solid rgba(110,86,207,0.25)",
              color: COLORS.text,
            }}
          >
            New Session / Event
          </button>
        </div>
      </div>

      <LiveCalendar
        events={events}
        onCreate={onCreate}
        onSelect={(ev) => setActive(ev)}
        onEdit={onEdit}
        onExport={onExport}
      />

      <EventDrawer
        open={drawerOpen}
        initial={editing}
        onClose={() => setDrawerOpen(false)}
        onSave={upsert}
      />

      <EventDetails
        item={active}
        onClose={() => setActive(null)}
        onEdit={() => {
          setEditing(active);
          setActive(null);
          setDrawerOpen(true);
        }}
        onSetStatus={setStatus}
        onSaveReplay={saveReplay}
        onCheckin={updateAttendeeCheckin}
        onExportOne={() => onExport([active])}
      />
    </div>
  );
};

export default LiveEventsPage;
