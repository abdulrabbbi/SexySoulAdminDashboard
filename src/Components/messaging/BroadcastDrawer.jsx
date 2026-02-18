import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { MdClose, MdMail, MdSmartphone, MdWeb } from "react-icons/md";

const COLORS = { bg2:"#12131A", card:"#161821", text:"#E6E8F0", text2:"#A3A7B7", ring:"rgba(110,86,207,0.25)", gold:"#D4AF37", purple:"#6E56CF" };

const ChannelBtn = ({ label, value, active, onClick}) => (
  <button
    onClick={() => onClick(value)}
    className="px-3 py-1.5 rounded-lg text-sm font-medium inline-flex items-center gap-2"
    style={{
      background: active ? `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.purple})` : "transparent",
      color: active ? "#0B0B0F" : COLORS.text2,
      border: active ? "none" : `1px solid ${COLORS.ring}`,
    }}
  >
    <Icon size={16} /> {label}
  </button>
);

const DEFAULT = {
  id:"", name:"", channel:"push", segments:["Paid"], status:"Draft",
  templateId:"", subject:"", title:"", body:"", scheduleAt:"",
  a_b:{ enabled:false, bSubject:"", bBody:"", bSplit:50 },
  metrics:{ sent:0, delivered:0, opens:0, clicks:0, unsub:0, timeseries:[] },
  logs:[]
};

const BroadcastDrawer = ({ open, initial, templates=[], onClose, onSave }) => {
  // ✅ hooks are always called
  const [mounted, setMounted] = useState(false);
  const [c, setC] = useState(DEFAULT);

  useEffect(() => { setMounted(true); return () => setMounted(false); }, []);
  useEffect(() => {
    // lock scroll only while visible
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);
  useEffect(() => { if (open) setC({ ...DEFAULT, ...(initial || {}) }); }, [open, initial]);

  const set = (patch) => setC((p) => ({ ...p, ...patch }));
  const availableTemplates = useMemo(() => templates.filter(t => t.type === c.channel), [templates, c.channel]);

  const insertVar = (token) => set({ body: `${c.body} {{${token}}}` });

  const submit = () => {
    if (!c.name.trim()) return alert("Campaign name is required.");
    if (c.channel === "email" && !c.subject.trim()) return alert("Email subject is required.");
    if ((c.channel === "push" || c.channel === "inapp") && !c.title.trim()) return alert("Title is required.");
    const now = new Date().toISOString().replace("T"," ").slice(0,16);
    const next = { ...c, logs: c.id ? c.logs : [{ ts: now, msg: "Campaign created" }], createdAt: c.createdAt || now };
    onSave?.(next);
  };

  if (!mounted) return null;

  return createPortal(
    <>
      {/* overlay & panel are present but hidden when !open */}
      <div
        className={`fixed inset-0 z-[2999] ${open ? "block" : "hidden"}`}
        onClick={onClose}
        style={{ backgroundColor:"rgba(0,0,0,0.55)" }}
      />
      <aside
        className={`fixed inset-y-0 right-0 w-[760px] max-w-[98vw] z-[3000] overflow-y-auto transition-transform duration-200 
                    ${open ? "translate-x-0" : "translate-x-full"}`}
        style={{ backgroundColor: COLORS.bg2, borderLeft:`1px solid ${COLORS.ring}`, color: COLORS.text }}
        aria-hidden={!open}
      >
        {/* Header */}
        <div className="p-4 sticky top-0 flex items-center justify-between"
             style={{ backgroundColor: COLORS.bg2, borderBottom:`1px solid ${COLORS.ring}` }}>
          <div>
            <div className="text-sm font-semibold">{c.id ? "Edit Broadcast" : "Create Broadcast"}</div>
            <div className="text-xs" style={{ color: COLORS.text2 }}>Compose • Preview • Schedule</div>
          </div>
          <button className="p-2 rounded-lg" onClick={onClose} aria-label="Close" style={{ color: COLORS.text2 }}>
            <MdClose size={20}/>
          </button>
        </div>

        {/* Body */}
        <div className="p-4 grid gap-4 lg:grid-cols-[1fr_320px]">
          {/* form left */}
          <div className="space-y-4">
            <div className="rounded-2xl p-4 space-y-3" style={{ backgroundColor: COLORS.card, border:`1px solid ${COLORS.ring}` }}>
              <div className="flex flex-wrap items-center gap-2">
                <ChannelBtn label="Push" value="push" active={c.channel==="push"} onClick={(v)=>set({ channel:v })} Icon={MdSmartphone}/>
                <ChannelBtn label="In-App" value="inapp" active={c.channel==="inapp"} onClick={(v)=>set({ channel:v })} Icon={MdWeb}/>
                <ChannelBtn label="Email" value="email" active={c.channel==="email"} onClick={(v)=>set({ channel:v })} Icon={MdMail}/>
              </div>
              <div>
                <label className="text-xs" style={{ color: COLORS.text2 }}>Campaign Name</label>
                <input
                  value={c.name}
                  onChange={(e)=>set({ name:e.target.value })}
                  className="mt-1 w-full rounded-lg px-3 py-2 text-sm outline-none"
                  style={{ backgroundColor:"#12131A", color: COLORS.text, border:`1px solid ${COLORS.ring}` }}
                  placeholder="August VIP Announcement"
                />
              </div>
            </div>

            <div className="rounded-2xl p-4 grid gap-3 sm:grid-cols-2" style={{ backgroundColor: COLORS.card, border:`1px solid ${COLORS.ring}` }}>
              <div>
                <label className="text-xs" style={{ color: COLORS.text2 }}>Template</label>
                <select
                  value={c.templateId || ""}
                  onChange={(e)=>set({ templateId:e.target.value })}
                  className="mt-1 w-full rounded-lg px-2 h-10 text-sm outline-none"
                  style={{ backgroundColor:"#12131A", color: COLORS.text, border:`1px solid ${COLORS.ring}` }}
                >
                  <option value="">— Select —</option>
                  {availableTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs" style={{ color: COLORS.text2 }}>Segments</label>
                <select
                  multiple
                  value={c.segments || []}
                  onChange={(e) => {
                    const opts = Array.from(e.target.selectedOptions).map(o => o.value);
                    set({ segments: opts });
                  }}
                  className="mt-1 w-full rounded-lg px-2 py-2 text-sm outline-none min-h-10"
                  style={{ backgroundColor:"#12131A", color: COLORS.text, border:`1px solid ${COLORS.ring}` }}
                >
                  {["Free","Paid","VIP","Brokers","Inactive"].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs" style={{ color: COLORS.text2 }}>Schedule (optional)</label>
                <input
                  type="datetime-local"
                  value={c.scheduleAt || ""}
                  onChange={(e)=>set({ scheduleAt:e.target.value })}
                  className="mt-1 w-full rounded-lg px-3 py-2 text-sm outline-none"
                  style={{ backgroundColor:"#12131A", color: COLORS.text, border:`1px solid ${COLORS.ring}` }}
                />
              </div>
              <div className="flex items-center gap-2 pt-5">
                <input
                  id="ab"
                  type="checkbox"
                  checked={!!c.a_b?.enabled}
                  onChange={(e)=>set({ a_b: { ...c.a_b, enabled: e.target.checked } })}
                  className="accent-[#6E56CF]"
                />
                <label htmlFor="ab" className="text-sm" style={{ color: COLORS.text2 }}>Enable A/B test</label>
              </div>
              {c.a_b?.enabled && c.channel === "email" && (
                <div className="sm:col-span-2 grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs" style={{ color: COLORS.text2 }}>Variant B Subject</label>
                    <input
                      value={c.a_b.bSubject || ""}
                      onChange={(e)=>set({ a_b: { ...c.a_b, bSubject: e.target.value } })}
                      className="mt-1 w-full rounded-lg px-3 py-2 text-sm outline-none"
                      style={{ backgroundColor:"#12131A", color: COLORS.text, border:`1px solid ${COLORS.ring}` }}
                    />
                  </div>
                  <div>
                    <label className="text-xs" style={{ color: COLORS.text2 }}>Split (%)</label>
                    <input
                      type="number" min={1} max={99}
                      value={c.a_b.bSplit || 50}
                      onChange={(e)=>set({ a_b: { ...c.a_b, bSplit: Number(e.target.value || 50) } })}
                      className="mt-1 w-full rounded-lg px-3 py-2 text-sm outline-none"
                      style={{ backgroundColor:"#12131A", color: COLORS.text, border:`1px solid ${COLORS.ring}` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-2xl p-4 space-y-3" style={{ backgroundColor: COLORS.card, border:`1px solid ${COLORS.ring}` }}>
              {c.channel === "email" && (
                <div>
                  <label className="text-xs" style={{ color: COLORS.text2 }}>Subject</label>
                  <input
                    value={c.subject}
                    onChange={(e)=>set({ subject:e.target.value })}
                    className="mt-1 w-full rounded-lg px-3 py-2 text-sm outline-none"
                    style={{ backgroundColor:"#12131A", color: COLORS.text, border:`1px solid ${COLORS.ring}` }}
                    placeholder="Your August Soul Note"
                  />
                </div>
              )}
              {(c.channel === "push" || c.channel === "inapp") && (
                <div>
                  <label className="text-xs" style={{ color: COLORS.text2 }}>Title</label>
                  <input
                    value={c.title}
                    onChange={(e)=>set({ title:e.target.value })}
                    className="mt-1 w-full rounded-lg px-3 py-2 text-sm outline-none"
                    style={{ backgroundColor:"#12131A", color: COLORS.text, border:`1px solid ${COLORS.ring}` }}
                    placeholder="VIP Mixer tonight"
                  />
                </div>
              )}
              <div>
                <label className="text-xs" style={{ color: COLORS.text2 }}>Message</label>
                <textarea
                  rows={6}
                  value={c.body}
                  onChange={(e)=>set({ body:e.target.value })}
                  className="mt-1 w-full rounded-lg px-3 py-2 text-sm outline-none resize-y"
                  style={{ backgroundColor:"#12131A", color: COLORS.text, border:`1px solid ${COLORS.ring}` }}
                  placeholder="Write your message..."
                />
                <div className="pt-2 flex flex-wrap items-center gap-2">
                  {["first_name","tier","event_name"].map(v => (
                    <button
                      key={v}
                      className="px-2 py-1 rounded-md text-xs"
                      style={{ backgroundColor:"#0F1118", border:`1px solid ${COLORS.ring}`, color: COLORS.text2 }}
                      onClick={() => insertVar(v)}
                    >
                      Insert {"{{"}{v}{"}}"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                className="px-3 py-2 rounded-xl text-sm font-medium"
                style={{ backgroundColor:"#12131A", border:`1px solid ${COLORS.ring}`, color: COLORS.text }}
                onClick={submit}
              >
                Save Draft
              </button>
              <button
                className="px-3 py-2 rounded-xl text-sm font-medium"
                style={{ background:`linear-gradient(90deg, ${COLORS.gold}, ${COLORS.purple})`, color:"#0B0B0F" }}
                onClick={submit}
              >
                Save & Close
              </button>
            </div>
          </div>

          {/* preview right */}
          <div className="space-y-3">
            <div className="rounded-2xl p-3" style={{ backgroundColor: COLORS.card, border:`1px solid ${COLORS.ring}` }}>
              <div className="text-xs mb-2" style={{ color: COLORS.text2 }}>Preview</div>
              <div className="mx-auto w-[280px] rounded-[28px] p-3" style={{ backgroundColor:"#0B0B0F", border:`1px solid ${COLORS.ring}` }}>
                <div className="mx-auto w-24 h-5 rounded-b-2xl mb-2" style={{ backgroundColor:"#12131A" }} />
                <div className="space-y-2 text-sm" style={{ color: COLORS.text }}>
                  {c.channel === "email" ? (
                    <>
                      <div className="font-semibold">Subject: {c.subject || "(no subject)"}</div>
                      <div className="rounded-lg p-2" style={{ backgroundColor:"#12131A", border:`1px solid ${COLORS.ring}` }}>
                        <div className="font-medium mb-1">{c.name || "Campaign"}</div>
                        <div className="text-xs" style={{ color: COLORS.text2 }}>{c.body || "Message..."}</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="font-semibold">{c.title || "(no title)"}</div>
                      <div className="text-xs" style={{ color: COLORS.text2 }}>{c.body || "Message..."}</div>
                      <div className="pt-2">
                        <button className="w-full rounded-lg py-1.5 text-sm font-semibold"
                                style={{ background:`linear-gradient(90deg, ${COLORS.gold}, ${COLORS.purple})`, color:"#0B0B0F" }}>
                          Open
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="rounded-2xl p-3" style={{ backgroundColor: COLORS.card, border:`1px solid ${COLORS.ring}` }}>
              <div className="text-xs" style={{ color: COLORS.text2 }}>
                Tip: actual rendering is handled by mobile/email templates. Preview is illustrative.
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>,
    document.body
  );
};

export default BroadcastDrawer;
