import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { IoClose } from "react-icons/io5";
import { MdEdit, MdDownload, MdContentCopy } from "react-icons/md";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend
} from "recharts";

const COLORS = {
  bg2: "#12131A",
  card: "#161821",
  text: "#E6E8F0",
  text2: "#A3A7B7",
  ring: "rgba(110,86,207,0.25)",
  gold: "#D4AF37",
  purple: "#6E56CF",
};

const DEFAULT_ITEM = {
  id: "",
  title: "",
  brand: "",
  category: "",
  tiers: [],
  status: "Draft",
  codeType: "code",
  codeValue: "",
  perUserLimit: 0,
  totalLimit: 0,
  validFrom: "",
  validTo: "",
  geo: { cities: [] },
  vendor: { logo: "", website: "", contact: "" },
  redemptions: { byCity: {}, byTier: {}, total: 0 },
};

const TabBtn = ({ active, children, onClick }) => (
  <button
    onClick={onClick}
    className="px-3 py-1.5 rounded-lg text-sm font-medium"
    style={{
      background: active ? `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.purple})` : "transparent",
      color: active ? "#0B0B0F" : COLORS.text2,
      border: active ? "none" : `1px solid ${COLORS.ring}`,
    }}
  >
    {children}
  </button>
);

const StatusPill = ({ status }) => {
  const map = {
    Active: { bg: "rgba(34,197,94,0.12)", fg: "#22C55E" },
    Paused: { bg: "rgba(245,158,11,0.12)", fg: "#F59E0B" },
    Expired: { bg: "rgba(239,68,68,0.12)", fg: "#EF4444" },
    Draft: { bg: "rgba(163,167,183,0.15)", fg: "#A3A7B7" },
  };
  const c = map[status] || map.Draft;
  return <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold" style={{ backgroundColor:c.bg, color:c.fg }}>{status}</span>;
};

const OfferDetails = ({ item, onClose, onEdit, onExportOne, sync }) => {
  // 🔒 Hooks are ALWAYS called
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState("overview");

  // Use a safe fallback object so hooks can run even when item is null
  const safe = item ?? DEFAULT_ITEM;

  useEffect(() => { setMounted(true); return () => setMounted(false); }, []);

  // Lock body scroll only when an item is open
  useEffect(() => {
    if (!item) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [item]);

  useEffect(() => setTab("overview"), [item?.id]);

  const cityData = useMemo(
    () => Object.entries(safe.redemptions?.byCity || {}).map(([city, count]) => ({ city, count })),
    [safe.redemptions?.byCity]
  );

  const tierData = useMemo(
    () => Object.entries(safe.redemptions?.byTier || {}).map(([name, value]) => ({ name, value })),
    [safe.redemptions?.byTier]
  );

  const tierColors = ["#6E56CF", "#D4AF37", "#2DD4BF", "#EC4899", "#F59E0B"];

  const copy = (s) => {
    navigator.clipboard?.writeText?.(s);
    alert("Copied to clipboard");
  };

  // Only render the PORTAL when we actually have an item open and we're mounted,
  // but hooks above still run every render to keep React happy.
  if (!item || !mounted) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-[2999]" onClick={onClose} style={{ backgroundColor:"rgba(0,0,0,0.55)" }} />
      <aside className="fixed inset-y-0 right-0 w-[560px] max-w-[96vw] z-[3000] overflow-y-auto"
             style={{ backgroundColor: COLORS.bg2, borderLeft:`1px solid ${COLORS.ring}` }}>
        {/* Header */}
        <div className="p-4 sticky top-0 flex items-center justify-between"
             style={{ backgroundColor: COLORS.bg2, borderBottom:`1px solid ${COLORS.ring}` }}>
          <div>
            <div className="text-sm font-semibold" style={{ color: COLORS.text }}>
              {safe.brand} — {safe.title}
            </div>
            <div className="text-xs" style={{ color: COLORS.text2 }}>
              {safe.category} • {safe.validFrom} → {safe.validTo}
            </div>
          </div>
          <button className="p-2 rounded-lg" onClick={onClose} aria-label="Close" style={{ color: COLORS.text2 }}>
            <IoClose size={20}/>
          </button>
        </div>

        {/* Tabs */}
        <div className="px-4 pt-3 pb-2 flex flex-wrap gap-2">
          <TabBtn active={tab==="overview"} onClick={()=>setTab("overview")}>Overview</TabBtn>
          <TabBtn active={tab==="geo"} onClick={()=>setTab("geo")}>Geo</TabBtn>
          <TabBtn active={tab==="codes"} onClick={()=>setTab("codes")}>Codes / QR</TabBtn>
          <TabBtn active={tab==="analytics"} onClick={()=>setTab("analytics")}>Analytics</TabBtn>
          <TabBtn active={tab==="sync"} onClick={()=>setTab("sync")}>PTM Sync</TabBtn>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4" style={{ color: COLORS.text }}>
          {tab === "overview" && (
            <div className="rounded-2xl p-4 space-y-3"
                 style={{ backgroundColor: COLORS.card, border:`1px solid ${COLORS.ring}` }}>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg overflow-hidden ring-1 bg-white flex items-center justify-center" style={{ borderColor: COLORS.ring }}>
                  {safe.vendor?.logo ? <img src={safe.vendor.logo} alt="logo" className="h-full w-full object-contain"/> : null}
                </div>
                <div>
                  <div className="font-semibold">{safe.brand || "—"}</div>
                  <div className="text-xs" style={{ color: COLORS.text2 }}>
                    {safe.vendor?.website ? <a href={safe.vendor.website} target="_blank" rel="noreferrer" className="underline">Website</a> : "—"} • {safe.vendor?.contact || "—"}
                  </div>
                </div>
                <div className="ml-auto"><StatusPill status={safe.status} /></div>
              </div>

              <div className="text-sm" style={{ color: COLORS.text2 }}>
                {safe.description || "No description."}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {(safe.tiers||[]).map(t => (
                  <span key={t} className="px-2 py-0.5 rounded-md text-[11px] font-semibold"
                        style={{ backgroundColor:"rgba(255,255,255,0.06)", border:`1px solid ${COLORS.ring}`, color: COLORS.text2 }}>
                    {t}
                  </span>
                ))}
              </div>

              <div className="pt-1 grid grid-cols-2 gap-3 text-sm">
                <div><span style={{ color: COLORS.text2 }}>Per-user Limit:</span> {safe.perUserLimit}</div>
                <div><span style={{ color: COLORS.text2 }}>Total Limit:</span> {safe.totalLimit}</div>
                <div className="col-span-2"><span style={{ color: COLORS.text2 }}>Cities:</span> {(safe.geo?.cities||[]).map(c=>c.name).join(", ") || "—"}</div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  className="px-3 py-2 rounded-xl text-sm font-medium inline-flex items-center gap-2"
                  style={{ backgroundColor:"#12131A", border:`1px solid ${COLORS.ring}`, color: COLORS.text }}
                  onClick={onExportOne}
                >
                  <MdDownload/> Export
                </button>
                <button
                  className="px-3 py-2 rounded-xl text-sm font-medium inline-flex items-center gap-2"
                  style={{ background:`linear-gradient(90deg, ${COLORS.gold}, ${COLORS.purple})`, color:"#0B0B0F" }}
                  onClick={onEdit}
                >
                  <MdEdit/> Edit
                </button>
              </div>
            </div>
          )}

          {tab === "geo" && (
            <div className="rounded-2xl p-4 space-y-3" style={{ backgroundColor: COLORS.card, border:`1px solid ${COLORS.ring}` }}>
              <div className="text-xs" style={{ color: COLORS.text2 }}>Coverage cities & approximate radii</div>
              <div className="grid gap-2">
                {(safe.geo?.cities||[]).map((c,i)=>(
                  <div key={`${c.name}-${i}`} className="flex items-center justify-between rounded-lg px-3 py-2"
                       style={{ backgroundColor:"#0F1118", border:`1px solid ${COLORS.ring}` }}>
                    <div className="text-sm">{c.name}</div>
                    <div className="text-xs" style={{ color: COLORS.text2 }}>{c.radiusKm} km radius</div>
                  </div>
                ))}
                {!safe.geo?.cities?.length && (
                  <div className="text-sm" style={{ color: COLORS.text2 }}>No cities configured.</div>
                )}
              </div>
              <div className="rounded-xl overflow-hidden ring-1" style={{ borderColor: COLORS.ring }}>
                <img src="/assets/Map.png" alt="Map" className="w-full h-40 object-contain opacity-90" />
              </div>
            </div>
          )}

          {tab === "codes" && (
            <div className="rounded-2xl p-4 space-y-3" style={{ backgroundColor: COLORS.card, border:`1px solid ${COLORS.ring}` }}>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span style={{ color: COLORS.text2 }}>Type:</span> {safe.codeType?.toUpperCase()}</div>
                <div className="truncate">
                  <span style={{ color: COLORS.text2 }}>Value:</span> {safe.codeValue || "—"}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-2 rounded-xl text-sm font-medium inline-flex items-center gap-2"
                  style={{ backgroundColor:"#12131A", border:`1px solid ${COLORS.ring}`, color: COLORS.text }}
                  onClick={() => safe.codeValue && copy(safe.codeValue)}
                >
                  <MdContentCopy/> Copy Code/Payload
                </button>
                <div className="text-xs" style={{ color: COLORS.text2 }}>
                  (Generate actual QR server-side or with a client lib.)
                </div>
              </div>
            </div>
          )}

          {tab === "analytics" && (
            <div className="rounded-2xl p-4 space-y-6" style={{ backgroundColor: COLORS.card, border:`1px solid ${COLORS.ring}` }}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl p-3" style={{ backgroundColor:"#0F1118", border:`1px solid ${COLORS.ring}` }}>
                  <div className="text-xs" style={{ color: COLORS.text2 }}>Total Redemptions</div>
                  <div className="text-lg font-semibold">{safe.redemptions?.total ?? 0}</div>
                </div>
                <div className="rounded-xl p-3" style={{ backgroundColor:"#0F1118", border:`1px solid ${COLORS.ring}` }}>
                  <div className="text-xs" style={{ color: COLORS.text2 }}>Cities</div>
                  <div className="text-lg font-semibold">{Object.keys(safe.redemptions?.byCity || {}).length}</div>
                </div>
                <div className="rounded-xl p-3" style={{ backgroundColor:"#0F1118", border:`1px solid ${COLORS.ring}` }}>
                  <div className="text-xs" style={{ color: COLORS.text2 }}>Tiers Used</div>
                  <div className="text-lg font-semibold">{Object.keys(safe.redemptions?.byTier || {}).length}</div>
                </div>
              </div>

              <div className="h-56 rounded-xl p-2" style={{ backgroundColor:"#0F1118", border:`1px solid ${COLORS.ring}` }}>
                <div className="px-2 py-1 text-xs" style={{ color: COLORS.text2 }}>Redemptions by City</div>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cityData} margin={{ top: 20, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="city" tick={{ fill: COLORS.text2, fontSize: 12 }} />
                    <YAxis tick={{ fill: COLORS.text2, fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: "#0F1118", border:`1px solid ${COLORS.ring}`, color: COLORS.text }} />
                    <Bar dataKey="count" fill={COLORS.purple} radius={[6,6,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="h-56 rounded-xl p-2" style={{ backgroundColor:"#0F1118", border:`1px solid ${COLORS.ring}` }}>
                <div className="px-2 py-1 text-xs" style={{ color: COLORS.text2 }}>Redemptions by Tier</div>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={tierData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={4}>
                      {tierData.map((_, i) => <Cell key={`c-${i}`} fill={tierColors[i % tierColors.length]} />)}
                    </Pie>
                    <Legend />
                    <Tooltip contentStyle={{ background: "#0F1118", border:`1px solid ${COLORS.ring}`, color: COLORS.text }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-end">
                <button
                  className="px-3 py-2 rounded-xl text-sm font-medium inline-flex items-center gap-2"
                  style={{ backgroundColor:"#12131A", border:`1px solid ${COLORS.ring}`, color: COLORS.text }}
                  onClick={onExportOne}
                >
                  <MdDownload/> Export Analytics
                </button>
              </div>
            </div>
          )}

          {tab === "sync" && (
            <div className="rounded-2xl p-4 space-y-3" style={{ backgroundColor: COLORS.card, border:`1px solid ${COLORS.ring}` }}>
              <div className="text-sm">PTM Sync Status: <span className="font-semibold">{sync?.status || "Idle"}</span></div>
              <div className="text-xs" style={{ color: COLORS.text2 }}>Last Sync: {sync?.lastSync || "—"}</div>
              <div className="pt-2">
                <div className="text-xs mb-1" style={{ color: COLORS.text2 }}>Recent Logs</div>
                <div className="space-y-2">
                  {(sync?.logs || []).map((l, i) => (
                    <div key={i} className="rounded-lg px-3 py-2 text-xs"
                         style={{ backgroundColor:"#0F1118", border:`1px solid ${COLORS.ring}`, color: COLORS.text2 }}>
                      <div className="font-medium" style={{ color: COLORS.text }}>{l.ts}</div>
                      <div>{l.msg}</div>
                    </div>
                  ))}
                  {!sync?.logs?.length && (
                    <div className="text-xs" style={{ color: COLORS.text2 }}>No logs yet.</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>,
    document.body
  );
};

export default OfferDetails;
