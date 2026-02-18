import  {  useState } from "react";
import BroadcastBoard from "../Components/messaging/BroadcastBoard";
import BroadcastDrawer from "../Components/messaging/BroadcastDrawer";
import BroadcastDetails from "../Components/messaging/BroadcastDetails";
import RepliesInbox from "../Components/messaging/RepliesInbox";
import ModerationBoard from "../Components/community/ModerationBoard";
import ModerationDetails from "../Components/community/ModerationDetails";

const COLORS = {
  text: "#E6E8F0",
  text2: "#A3A7B7",
  ring: "rgba(110,86,207,0.25)",
  gold: "#D4AF37",
  purple: "#6E56CF",
};

/** ------------ Seed Data ------------- */
const SEED_CAMPAIGNS = [
  {
    id: "bc_1001",
    name: "VIP Networking Tonight",
    channel: "push", // push | inapp | email
    segments: ["VIP"],
    status: "Scheduled", // Draft | Scheduled | Sending | Sent | Cancelled
    templateId: "tpl_push_01",
    subject: "",
    title: "VIP Mixer: 7 PM 🥂",
    body: "Join the founders live in the lounge. Tap to RSVP.",
    scheduleAt: "2025-08-22 18:30",
    a_b: { enabled: false },
    metrics: {
      sent: 4800,
      delivered: 4700,
      opens: 1900,
      clicks: 840,
      unsub: 6,
      timeseries: [
        { t: "18:30", sent: 2000, open: 600, click: 210 },
        { t: "18:45", sent: 2800, open: 980, click: 370 },
        { t: "19:00", sent: 4800, open: 1500, click: 610 },
        { t: "19:30", sent: 4800, open: 1900, click: 840 },
      ],
    },
    createdAt: "2025-08-21 10:15",
    logs: [
      { ts: "2025-08-21 10:15", msg: "Campaign created by @alex" },
      { ts: "2025-08-22 12:05", msg: "Schedule updated to 18:30 PKT" },
    ],
  },
  {
    id: "bc_1002",
    name: "Monthly Soul Note",
    channel: "email",
    segments: ["Paid", "VIP"],
    status: "Sent",
    templateId: "tpl_email_01",
    subject: "Your August Soul Note 💌",
    title: "",
    body: "This month, focus on consistency...",
    scheduleAt: "2025-08-10 10:00",
    a_b: {
      enabled: true,
      bSubject: "August Soul Note — A Gift Inside",
      bSplit: 50,
    },
    metrics: {
      sent: 9200,
      delivered: 9000,
      opens: 4800,
      clicks: 1650,
      unsub: 24,
      timeseries: [
        { t: "10:00", sent: 4500, open: 1200, click: 380 },
        { t: "11:00", sent: 9200, open: 2800, click: 950 },
        { t: "13:00", sent: 9200, open: 4200, click: 1400 },
        { t: "16:00", sent: 9200, open: 4800, click: 1650 },
      ],
    },
    createdAt: "2025-08-08 09:20",
    logs: [
      { ts: "2025-08-08 09:20", msg: "Draft created by @jerry" },
      {
        ts: "2025-08-10 10:00",
        msg: "A/B test concluded — Variant B won (29% opens)",
      },
    ],
  },
];

const SEED_TEMPLATES = [
  { id: "tpl_push_01", type: "push", name: "Short Push (CTA)" },
  { id: "tpl_inapp_01", type: "inapp", name: "In-App Banner" },
  { id: "tpl_email_01", type: "email", name: "Newsletter (1-col)" },
];

const SEED_REPLIES = [
  {
    id: "rp_01",
    user: "Amara K",
    email: "amara@example.com",
    channel: "email",
    text: "Loved the August note!",
    ts: "2025-08-10 11:12",
    status: "new",
  },
  {
    id: "rp_02",
    user: "Bilal S",
    email: "bilal@example.com",
    channel: "push",
    text: "When is the next live?",
    ts: "2025-08-18 17:40",
    status: "open",
  },
];

const SEED_ROOMS = [
  { id: "rm_gen", name: "General", members: 1820 },
  { id: "rm_vip", name: "VIP Lounge", members: 340 },
  { id: "rm_events", name: "Events", members: 780 },
];

const SEED_REPORTS = [
  {
    id: "rep_100",
    room: "General",
    user: "user_5521",
    reason: "Spam links",
    ts: "2025-08-19 21:05",
    content: "Check this site for free crypto $$$",
    status: "Open",
  },
  {
    id: "rep_101",
    room: "VIP Lounge",
    user: "user_1180",
    reason: "Harassment",
    ts: "2025-08-20 10:14",
    content: "You're a fraud",
    status: "Open",
  },
];

const MessagingCommunityPage = () => {
  const [campaigns, setCampaigns] = useState(SEED_CAMPAIGNS);
  
  const [inbox, setInbox] = useState(SEED_REPLIES);
  const [rooms] = useState(SEED_ROOMS);
  const [reports, setReports] = useState(SEED_REPORTS);

  // UI state
  const [composeOpen, setComposeOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [activeCampaign, setActiveCampaign] = useState(null);

  const [activeReport, setActiveReport] = useState(null);
  const [blocklist, setBlocklist] = useState(["scam", "free crypto", "xxx"]);
  const [rateLimit, setRateLimit] = useState(15); // messages per 60s

  /** ------- Broadcast CRUD + Export ------- */
  const onCreate = () => {
    setEditing(null);
    setComposeOpen(true);
  };
  const onEdit = (row) => {
    setEditing(row);
    setComposeOpen(true);
  };
  const onSelect = (row) => setActiveCampaign(row);

  const upsertCampaign = (record) => {
    setCampaigns((prev) => {
      const exists = prev.some((c) => c.id === record.id);
      if (exists) return prev.map((c) => (c.id === record.id ? record : c));
      const id = `bc_${Math.floor(Math.random() * 9000) + 1000}`;
      return [{ ...record, id }, ...prev];
    });
    setComposeOpen(false);
  };

  const exportCampaigns = (rows) => {
    const headers = [
      "ID",
      "Name",
      "Channel",
      "Segments",
      "Status",
      "Subject",
      "Title",
      "ScheduledAt",
      "Sent",
      "Delivered",
      "Opens",
      "Clicks",
      "Unsub",
    ];
    const src = rows?.length ? rows : campaigns;
    const lines = src.map((c) => [
      c.id,
      c.name,
      c.channel,
      (c.segments || []).join("|"),
      c.status,
      c.subject || "",
      c.title || "",
      c.scheduleAt || "",
      c.metrics?.sent || 0,
      c.metrics?.delivered || 0,
      c.metrics?.opens || 0,
      c.metrics?.clicks || 0,
      c.metrics?.unsub || 0,
    ]);
    const csv = [headers, ...lines]
      .map((r) =>
        r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `broadcasts_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCampaignOne = (c) => exportCampaigns([c]);

  /** ------- Inbox ops (mock) ------- */
  const resolveReply = (id) =>
    setInbox((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: "resolved" } : m))
    );

  /** ------- Moderation actions ------- */
  const takeModerationAction = (reportId, action) => {
    // action: warn | mute | ban | shadowban | delete | dismiss
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? { ...r, status: action === "dismiss" ? "Dismissed" : "Actioned" }
          : r
      )
    );
    setActiveReport(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1
          className="text-xl md:text-2xl font-semibold"
          style={{ color: COLORS.text }}
        >
          Messaging & Community
        </h1>
        <button
          className="h-9 px-3 rounded-lg text-sm font-medium"
          style={{
            background: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.purple})`,
            color: "#0B0B0F",
          }}
          onClick={onCreate}
        >
          New Broadcast
        </button>
      </div>

      {/* Broadcasts */}
      <BroadcastBoard
        data={campaigns}
        onCreate={onCreate}
        onEdit={onEdit}
        onSelect={onSelect}
        onExport={exportCampaigns}
      />

      {/* Replies Inbox */}
      <RepliesInbox data={inbox} onResolve={resolveReply} />

      {/* Community Moderation */}
      <ModerationBoard
        rooms={rooms}
        reports={reports}
        onSelectReport={setActiveReport}
        blocklist={blocklist}
        setBlocklist={setBlocklist}
        rateLimit={rateLimit}
        setRateLimit={setRateLimit}
      />

      {/* Drawers / Details (always mounted) */}
      <BroadcastDrawer
        open={composeOpen}
        initial={editing}
        templates={SEED_TEMPLATES}
        onClose={() => setComposeOpen(false)}
        onSave={upsertCampaign}
      />

      <BroadcastDetails
        open={!!activeCampaign}
        campaign={activeCampaign || null}
        onClose={() => setActiveCampaign(null)}
        onEdit={() => {
          setEditing(activeCampaign);
          setActiveCampaign(null);
          setComposeOpen(true);
        }}
        onExportOne={() => exportCampaignOne(activeCampaign)}
      />

      <ModerationDetails
        open={!!activeReport}
        report={activeReport || null}
        onClose={() => setActiveReport(null)}
        onAction={takeModerationAction}
      />
    </div>
  );
};

export default MessagingCommunityPage;
