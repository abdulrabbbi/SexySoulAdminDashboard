import React, { useMemo, useState } from "react";
import { MdHeadsetMic, MdPhotoLibrary, MdSettings } from "react-icons/md";
import TicketsBoard from "../Components/support/TicketsBoard";
import TicketDetails from "../Components/support/TicketDetails";
import MediaLibrary from "../Components/support/MediaLibrary";
import MediaUploadDrawer from "../Components/support/MediaUploadDrawer";
import AssetDetails from "../Components/support/AssetDetails";
import SettingsPanel from "../Components/support/SettingsPanel";

// eslint-disable-next-line react-refresh/only-export-components
export const COLORS = {
  onyx: "#0B0B0F",
  bg2: "#12131A",
  card: "#161821",
  text: "#E6E8F0",
  text2: "#A3A7B7",
  ring: "rgba(110,86,207,0.25)",
  gold: "#D4AF37",
  purple: "#6E56CF",
  success: "#22C55E",
  warn: "#F59E0B",
  danger: "#EF4444",
  info: "#3B82F6",
};

const TABS = [
  { key: "tickets", label: "Tickets", Icon: MdHeadsetMic },
  { key: "media", label: "Media", Icon: MdPhotoLibrary },
  { key: "settings", label: "Settings", Icon: MdSettings },
];

const SupportMediaSettingsPage = () => {
  const [tab, setTab] = useState("tickets");

  // Tickets state
  const [tickets, setTickets] = useState(() => seedTickets());
  const [activeTicket, setActiveTicket] = useState(null);

  // Media state
  const [assets, setAssets] = useState(() => seedAssets());
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [activeAsset, setActiveAsset] = useState(null);

  // Settings state (brand/integrations/roles etc.) — stored in this page so it persists across inner tabs
  const [brand, setBrand] = useState(seedBrand());
  const [founders, setFounders] = useState(seedFounders());
  const [plans, setPlans] = useState(seedPlans());
  const [integrations, setIntegrations] = useState(seedIntegrations());
  const [roles, setRoles] = useState(seedRoles());
  const [audit, setAudit] = useState(seedAudit());

  // Tickets actions
  const upsertTicket = (t) => {
    setTickets((prev) => {
      const exists = prev.some((x) => x.id === t.id);
      if (exists) return prev.map((x) => (x.id === t.id ? t : x));
      return [{ ...t, id: `t_${Date.now()}` }, ...prev];
    });
  };
  const exportTickets = (rows) => downloadCSV("tickets", rows || tickets, (t) => ({
    ID: t.id, Subject: t.subject, Status: t.status, Priority: t.priority,
    Assignee: t.assignee || "", SLA_Due: t.slaDue || "", User: t.user?.email || "",
    UpdatedAt: t.updatedAt || "", CreatedAt: t.createdAt || ""
  }));

  // Media actions
  const upsertAsset = (a) => {
    setAssets((prev) => {
      const exists = prev.some((x) => x.id === a.id);
      if (exists) return prev.map((x) => (x.id === a.id ? a : x));
      return [{ ...a, id: `asset_${Date.now()}` }, ...prev];
    });
    setUploadOpen(false);
    setEditingAsset(null);
  };
  const exportAssets = (rows) => downloadCSV("assets", rows || assets, (a) => ({
    ID: a.id, Name: a.name, Type: a.type, Size: a.size, Tags: (a.tags || []).join("|"),
    Version: a.version, UsedIn: (a.usage || []).join("; "), CreatedAt: a.createdAt
  }));

  // Settings actions
  const saveBrand = (next) => setBrand(next);
  const saveFounders = (list) => setFounders(list);
  const savePlans = (next) => setPlans(next);
  const saveIntegrations = (next) => setIntegrations(next);
  const saveRoles = (next) => setRoles(next);
  const addAudit = (entry) =>
    setAudit((prev) => [{ id: `log_${Date.now()}`, ...entry }, ...prev].slice(0, 300));
  const exportAudit = () =>
    downloadCSV("audit_logs", audit, (r) => ({
      ID: r.id, Actor: r.actor, Action: r.action, Target: r.target, At: r.at,
    }));

  // page content
  const content = useMemo(() => {
    if (tab === "tickets")
      return (
        <TicketsBoard
          data={tickets}
          onSelect={(t) => setActiveTicket(t)}
          onExport={exportTickets}
          onResolve={(id) =>
            setTickets((prev) =>
              prev.map((x) => (x.id === id ? { ...x, status: "Resolved" } : x))
            )
          }
        />
      );
    if (tab === "media")
      return (
        <MediaLibrary
          data={assets}
          onCreate={() => {
            setEditingAsset(null);
            setUploadOpen(true);
          }}
          onEdit={(asset) => {
            setEditingAsset(asset);
            setUploadOpen(true);
          }}
          onSelect={(asset) => setActiveAsset(asset)}
          onExport={exportAssets}
        />
      );
    return (
      <SettingsPanel
        brand={brand}
        onSaveBrand={(b) => { saveBrand(b); addAudit({ actor: "You", action: "Updated Brand Kit", target: "Brand", at: ts() }); }}
        founders={founders}
        onSaveFounders={(f) => { saveFounders(f); addAudit({ actor: "You", action: "Edited Founders", target: "Founders", at: ts() }); }}
        plans={plans}
        onSavePlans={(p) => { savePlans(p); addAudit({ actor: "You", action: "Updated Plans/Features", target: "Plans", at: ts() }); }}
        integrations={integrations}
        onSaveIntegrations={(i) => { saveIntegrations(i); addAudit({ actor: "You", action: "Changed Integrations", target: "Integrations", at: ts() }); }}
        roles={roles}
        onSaveRoles={(r) => { saveRoles(r); addAudit({ actor: "You", action: "Changed Roles", target: "RBAC", at: ts() }); }}
        audit={audit}
        onExportAudit={exportAudit}
      />
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, tickets, assets, brand, founders, plans, integrations, roles, audit]);

  return (
    <div className="space-y-5">
      {/* Top tabs */}
      <div className="flex items-center gap-2">
        {TABS.map(({ key, label}) => {
          const active = tab === key;
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              className="px-3 py-1.5 rounded-lg text-sm font-semibold inline-flex items-center gap-2"
              style={{
                background: active
                  ? `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.purple})`
                  : "transparent",
                color: active ? "#0B0B0F" : COLORS.text2,
                border: active ? "none" : `1px solid ${COLORS.ring}`,
              }}
            >
              <Icon size={16} /> {label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div>{content}</div>

      {/* Drawers / Details for Tickets */}
      <TicketDetails
        open={!!activeTicket}
        ticket={activeTicket}
        onClose={() => setActiveTicket(null)}
        onSave={(t) => {
          upsertTicket(t);
          setActiveTicket(null);
        }}
      />

      {/* Drawers / Details for Media */}
      <MediaUploadDrawer
        open={uploadOpen}
        initial={editingAsset}
        onClose={() => {
          setUploadOpen(false);
          setEditingAsset(null);
        }}
        onSave={upsertAsset}
      />
      <AssetDetails
        open={!!activeAsset}
        asset={activeAsset}
        onClose={() => setActiveAsset(null)}
        onReplace={() => {
          setEditingAsset(activeAsset);
          setActiveAsset(null);
          setUploadOpen(true);
        }}
      />
    </div>
  );
};

export default SupportMediaSettingsPage;

/* ------------------------- helpers + seeds ------------------------- */
function downloadCSV(prefix, arr, map) {
  const rows = arr.map(map);
  const headers = Object.keys(rows[0] || {});
  const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => q(r[h])).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${prefix}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
const q = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
const ts = () => new Date().toISOString().replace("T", " ").slice(0, 16);

function seedTickets() {
  return [
    {
      id: "t_1001",
      subject: "Cannot access VIP replay",
      status: "Open", // New | Open | Pending | Resolved | Closed
      priority: "High",
      assignee: "Ayesha",
      createdAt: "2025-08-19 09:04",
      updatedAt: "2025-08-19 10:22",
      slaDue: "2025-08-19 13:04",
      user: {
        name: "Natali Craig",
        email: "natali@example.com",
        tier: "VIP",
        invoices: [{ id: "inv_1", amount: 19.95, date: "2025-08-01" }],
      },
      thread: [
        { who: "User", at: "2025-08-19 09:04", text: "My replay link fails to load." },
        { who: "Ayesha (Support)", at: "2025-08-19 10:05", text: "Checking now! Can you try relogin?" },
      ],
      notes: [{ at: "2025-08-19 10:20", by: "Ayesha", text: "Likely expired URL; reset link." }],
    },
    {
      id: "t_1002",
      subject: "Billing double charge",
      status: "Pending",
      priority: "Medium",
      assignee: "Bilal",
      createdAt: "2025-08-18 16:11",
      updatedAt: "2025-08-18 17:02",
      slaDue: "2025-08-19 16:11",
      user: {
        name: "Jerry Maguire",
        email: "jerry@example.com",
        tier: "Paid",
        invoices: [
          { id: "inv_9", amount: 19.95, date: "2025-08-01" },
          { id: "inv_10", amount: 19.95, date: "2025-08-01" },
        ],
      },
      thread: [{ who: "User", at: "2025-08-18 16:11", text: "I think I was charged twice." }],
      notes: [],
    },
  ];
}
function seedAssets() {
  return [
    {
      id: "asset_1",
      name: "VIP Mixer Cover",
      type: "image",
      size: "320KB",
      version: 3,
      tags: ["vip", "events", "cover"],
      preview: "https://images.unsplash.com/photo-1529158062015-cad636e205a0?q=80&w=600",
      usage: ["Event: VIP Mixer Dubai", "Broadcast: August VIP Teaser"],
      createdAt: "2025-08-10 13:22",
      versions: [
        { v: 1, at: "2025-08-05 09:34" },
        { v: 2, at: "2025-08-08 16:02" },
        { v: 3, at: "2025-08-10 13:22" },
      ],
      cdn: "https://cdn.example.com/assets/vip-mixer-cover.jpg",
    },
    {
      id: "asset_2",
      name: "Onboarding Intro.mp4",
      type: "video",
      size: "18.2MB",
      version: 1,
      tags: ["onboarding", "promo"],
      preview: "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?q=80&w=600",
      usage: ["App Intro"],
      createdAt: "2025-08-02 11:10",
      versions: [{ v: 1, at: "2025-08-02 11:10" }],
      cdn: "https://cdn.example.com/assets/onboarding-intro.mp4",
    },
  ];
}
function seedBrand() {
  return {
    logo: "/assets/Logo.png",
    colors: {
      primary: COLORS.purple,
      accent: COLORS.gold,
      bg: COLORS.onyx,
      text: COLORS.text,
    },
    typography: { ui: "Inter", brand: "Playfair Display" },
  };
}
function seedFounders() {
  return [
    { id: "f_sunil", name: "Sunil Gadtuala", title: "Marketing PTM", handles: { ig: "@sunil", x: "@sunil" } },
    { id: "f_russell", name: "Russell Davis", title: "Real Estate", handles: { ig: "@russell", x: "@russell" } },
    { id: "f_guy", name: "Guy Fortt", title: "Distribution", handles: { ig: "@guy", x: "@guy" } },
    { id: "f_calvin", name: "Calvin Richardson", title: "Entertainment", handles: { ig: "@calvin", x: "@calvin" } },
  ];
}
function seedPlans() {
  return {
    tiers: [
      { name: "Free", price: 0, features: ["Motivational feed", "Event updates"] },
      { name: "Paid", price: 19.95, features: ["Premium content", "Discounts", "Networking"] },
      { name: "VIP", price: 49.0, features: ["1:1 mentorship", "VIP events", "Legacy box"] },
    ],
  };
}
function seedIntegrations() {
  return [
    { key: "stripe", name: "Stripe", status: "Connected", last: "2025-08-18 10:00" },
    { key: "ptm", name: "PTM", status: "Connected", last: "2025-08-18 14:35" },
    { key: "zoom", name: "Zoom/RTMP", status: "Connected", last: "2025-08-17 18:12" },
    { key: "email", name: "Email/Push", status: "Connected", last: "2025-08-18 09:20" },
    { key: "analytics", name: "Analytics", status: "Connected", last: "2025-08-18 08:44" },
  ];
}
function seedRoles() {
  return [
    { role: "Super Admin", perms: ["all"] },
    { role: "Content Admin", perms: ["content.view", "content.edit"] },
    { role: "Events Manager", perms: ["events.view", "events.edit", "live.moderate"] },
    { role: "Support", perms: ["tickets.view", "tickets.reply"] },
    { role: "Finance", perms: ["billing.view", "refunds.process"] },
  ];
}
function seedAudit() {
  return [
    { id: "log_1", actor: "Ayesha", action: "Updated Plan price", target: "Paid", at: "2025-08-18 12:02" },
    { id: "log_2", actor: "Bilal", action: "Connected Stripe", target: "Stripe", at: "2025-08-17 19:40" },
  ];
}
