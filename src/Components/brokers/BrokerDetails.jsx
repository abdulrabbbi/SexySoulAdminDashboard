import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { IoClose } from "react-icons/io5";
import { MdEdit, MdDownload, MdContentCopy, MdCheckCircle } from "react-icons/md";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Legend
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

const Pill = ({ label, tone = "neutral" }) => {
  const map = {
    success: { bg: "rgba(34,197,94,0.12)", fg: "#22C55E" },
    warn:    { bg: "rgba(245,158,11,0.12)", fg: "#F59E0B" },
    danger:  { bg: "rgba(239,68,68,0.12)", fg: "#EF4444" },
    neutral: { bg: "rgba(163,167,183,0.15)", fg: "#A3A7B7" },
  };
  const c = map[tone] || map.neutral;
  return <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold" style={{ backgroundColor:c.bg, color:c.fg }}>{label}</span>;
};

const BrokerDetails = ({ broker, onClose, onEdit, onMarkPaid, onAddPayout, onExportOne }) => {
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState("overview");

  useEffect(() => { setMounted(true); return () => setMounted(false); }, []);
  useEffect(() => {
    if (!broker) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [broker]);
  useEffect(() => setTab("overview"), [broker?.id]);

  const perfData = useMemo(() => {
    const m = broker?.performance?.months || [];
    const a = broker?.performance?.activations || [];
    const e = broker?.performance?.earnings || [];
    return m.map((month, i) => ({ month, activations: a[i] || 0, earnings: e[i] || 0 }));
  }, [broker]);

  const kycTone = (k) => (k === "Approved" ? "success" : k === "Pending" ? "warn" : "danger");

  if (!broker || !mounted) return null;

  const copy = (s) => {
    navigator.clipboard?.writeText?.(s);
    alert("Copied to clipboard");
  };

  return createPortal(
    <>
      <div className="fixed inset-0 z-[2999]" onClick={onClose} style={{ backgroundColor:"rgba(0,0,0,0.55)" }} />
      <aside className="fixed inset-y-0 right-0 w-[620px] max-w-[96vw] z-[3000] overflow-y-auto"
             style={{ backgroundColor: COLORS.bg2, borderLeft:`1px solid ${COLORS.ring}` }}>
        {/* Header */}
        <div className="p-4 sticky top-0 flex items-center justify-between"
             style={{ backgroundColor: COLORS.bg2, borderBottom:`1px solid ${COLORS.ring}` }}>
          <div className="flex items-center gap-3">
            <img src={broker.avatar} alt={broker.name} className="h-9 w-9 rounded-full object-cover" />
            <div>
              <div className="text-sm font-semibold" style={{ color: COLORS.text }}>{broker.name} · <span className="font-normal">{broker.email}</span></div>
              <div className="text-xs" style={{ color: COLORS.text2 }}>ID: {broker.id} • Joined {broker.joinedAt}</div>
            </div>
          </div>
          <button className="p-2 rounded-lg" onClick={onClose} aria-label="Close" style={{ color: COLORS.text2 }}>
            <IoClose size={20}/>
          </button>
        </div>

        {/* Tabs */}
        <div className="px-4 pt-3 pb-2 flex flex-wrap gap-2">
          <TabBtn active={tab==="overview"} onClick={()=>setTab("overview")}>Overview</TabBtn>
          <TabBtn active={tab==="performance"} onClick={()=>setTab("performance")}>Performance</TabBtn>
          <TabBtn active={tab==="history"} onClick={()=>setTab("history")}>History</TabBtn>
          <TabBtn active={tab==="payouts"} onClick={()=>setTab("payouts")}>Payouts</TabBtn>
          <TabBtn active={tab==="resources"} onClick={()=>setTab("resources")}>Resources</TabBtn>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4" style={{ color: COLORS.text }}>
          {tab === "overview" && (
            <div className="rounded-2xl p-4 space-y-3" style={{ backgroundColor: COLORS.card, border:`1px solid ${COLORS.ring}` }}>
              <div className="flex flex-wrap items-center gap-2">
                <Pill label={broker.status} tone={broker.status === "Active" ? "success" : "neutral"} />
                <Pill label={`KYC: ${broker.kyc}`} tone={kycTone(broker.kyc)} />
                {broker.chargebacks > 0 && <Pill label={`Chargebacks: ${broker.chargebacks}`} tone="warn" />}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div className="rounded-xl p-3" style={{ backgroundColor:"#0F1118", border:`1px solid ${COLORS.ring}` }}>
                  <div className="text-xs" style={{ color: COLORS.text2 }}>Activations</div>
                  <div className="text-lg font-semibold">{broker.activations}</div>
                </div>
                <div className="rounded-xl p-3" style={{ backgroundColor:"#0F1118", border:`1px solid ${COLORS.ring}` }}>
                  <div className="text-xs" style={{ color: COLORS.text2 }}>Earnings</div>
                  <div className="text-lg font-semibold">${broker.earnings}</div>
                </div>
                <div className="rounded-xl p-3" style={{ backgroundColor:"#0F1118", border:`1px solid ${COLORS.ring}` }}>
                  <div className="text-xs" style={{ color: COLORS.text2 }}>Commission</div>
                  <div className="text-lg font-semibold">{Math.round(broker.commissionRate*100)}%</div>
                </div>
                <div className="rounded-xl p-3" style={{ backgroundColor:"#0F1118", border:`1px solid ${COLORS.ring}` }}>
                  <div className="text-xs" style={{ color: COLORS.text2 }}>Last Active</div>
                  <div className="text-lg font-semibold">{broker.lastActive}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
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
                <button
                  className="px-3 py-2 rounded-xl text-sm font-medium inline-flex items-center gap-2"
                  style={{ backgroundColor:"#12131A", border:`1px solid ${COLORS.ring}`, color: COLORS.text2 }}
                  onClick={() => copy(broker.id)}
                >
                  <MdContentCopy/> Copy ID
                </button>
              </div>
            </div>
          )}

          {tab === "performance" && (
            <div className="space-y-4">
              <div className="rounded-2xl p-4" style={{ backgroundColor: COLORS.card, border:`1px solid ${COLORS.ring}` }}>
                <div className="text-xs mb-2" style={{ color: COLORS.text2 }}>Activations (last months)</div>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={perfData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                      <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="month" tick={{ fill: COLORS.text2, fontSize: 12 }} />
                      <YAxis tick={{ fill: COLORS.text2, fontSize: 12 }} />
                      <Tooltip contentStyle={{ background:"#0F1118", border:`1px solid ${COLORS.ring}`, color: COLORS.text }} />
                      <Line type="monotone" dataKey="activations" stroke={COLORS.purple} strokeWidth={3} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-2xl p-4" style={{ backgroundColor: COLORS.card, border:`1px solid ${COLORS.ring}` }}>
                <div className="text-xs mb-2" style={{ color: COLORS.text2 }}>Earnings ($) by month</div>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={perfData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                      <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="month" tick={{ fill: COLORS.text2, fontSize: 12 }} />
                      <YAxis tick={{ fill: COLORS.text2, fontSize: 12 }} />
                      <Tooltip contentStyle={{ background:"#0F1118", border:`1px solid ${COLORS.ring}`, color: COLORS.text }} />
                      <Legend />
                      <Bar dataKey="earnings" fill={COLORS.gold} radius={[6,6,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {tab === "history" && (
            <div className="rounded-2xl p-4 space-y-2" style={{ backgroundColor: COLORS.card, border:`1px solid ${COLORS.ring}` }}>
              {(broker.history || []).map((h, i) => (
                <div key={i} className="rounded-lg px-3 py-2 text-sm"
                     style={{ backgroundColor:"#0F1118", border:`1px solid ${COLORS.ring}`, color: COLORS.text }}>
                  <div className="text-xs mb-0.5" style={{ color: COLORS.text2 }}>{h.ts}</div>
                  <div>{h.text}</div>
                </div>
              ))}
              {!broker.history?.length && (
                <div className="text-sm" style={{ color: COLORS.text2 }}>No history yet.</div>
              )}
            </div>
          )}

          {tab === "payouts" && (
            <div className="rounded-2xl p-4" style={{ backgroundColor: COLORS.card, border:`1px solid ${COLORS.ring}` }}>
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-semibold">Payout Statements</div>
                <button
                  className="px-3 py-2 rounded-xl text-sm font-medium inline-flex items-center gap-2"
                  style={{ background:`linear-gradient(90deg, ${COLORS.gold}, ${COLORS.purple})`, color:"#0B0B0F" }}
                  onClick={onAddPayout}
                >
                  Generate Statement
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-[560px] w-full text-sm">
                  <thead>
                    <tr style={{ color: COLORS.text2, borderBottom:`1px solid ${COLORS.ring}` }}>
                      <th className="py-2 text-left">Period</th>
                      <th className="py-2 text-left">Amount</th>
                      <th className="py-2 text-left">Status</th>
                      <th className="py-2 text-left">Paid At</th>
                      <th className="py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(broker.payouts || []).map((p) => (
                      <tr key={p.id} style={{ color: COLORS.text, borderBottom:`1px solid ${COLORS.ring}` }}>
                        <td className="py-2">{p.period}</td>
                        <td className="py-2">${p.amount}</td>
                        <td className="py-2">
                          {p.status === "Paid"
                            ? <span className="inline-flex items-center gap-1 text-xs text-[#22C55E]"><MdCheckCircle/>&nbsp;Paid</span>
                            : <span className="text-xs" style={{ color: COLORS.text2 }}>Pending</span>}
                        </td>
                        <td className="py-2">{p.paidAt || "—"}</td>
                        <td className="py-2">
                          <div className="flex items-center gap-2">
                            {p.status !== "Paid" && (
                              <button
                                className="px-2.5 py-1.5 rounded-md text-xs font-semibold"
                                style={{ backgroundColor:"#12131A", border:`1px solid ${COLORS.ring}`, color: COLORS.text }}
                                onClick={() => onMarkPaid?.(p.id)}
                              >
                                Mark Paid
                              </button>
                            )}
                            <button
                              className="px-2.5 py-1.5 rounded-md text-xs font-semibold"
                              style={{ backgroundColor:"#12131A", border:`1px solid ${COLORS.ring}`, color: COLORS.text }}
                              onClick={onExportOne}
                            >
                              <MdDownload size={16}/> Export
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!broker.payouts?.length && (
                      <tr><td className="py-6 text-center" colSpan={5} style={{ color: COLORS.text2 }}>No statements yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === "resources" && (
            <div className="rounded-2xl p-4 space-y-2" style={{ backgroundColor: COLORS.card, border:`1px solid ${COLORS.ring}` }}>
              {(broker.resources || []).map((r, i) => (
                <a key={i} href={r.url} className="block rounded-lg px-3 py-2 text-sm"
                   style={{ backgroundColor:"#0F1118", border:`1px solid ${COLORS.ring}`, color: COLORS.text }}>
                  <span className="font-medium">{r.title}</span>
                  <span className="ml-2 text-xs" style={{ color: COLORS.text2 }}>({r.type})</span>
                </a>
              ))}
              {!broker.resources?.length && (
                <div className="text-sm" style={{ color: COLORS.text2 }}>No training collateral yet.</div>
              )}
            </div>
          )}
        </div>
      </aside>
    </>,
    document.body
  );
};

export default BrokerDetails;
