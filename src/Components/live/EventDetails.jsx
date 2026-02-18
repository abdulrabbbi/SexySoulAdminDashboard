import  { useEffect , useState } from "react";
import { createPortal } from "react-dom";
import { IoClose } from "react-icons/io5";
import { MdPlayCircle, MdStopCircle, MdVideoLibrary, MdSend, MdQrCode2, MdDownload, MdEdit } from "react-icons/md";

const COLORS = {
  bg2: "#12131A",
  card: "#161821",
  text: "#E6E8F0",
  text2: "#A3A7B7",
  ring: "rgba(110,86,207,0.25)",
  gold: "#D4AF37",
  purple: "#6E56CF",
  ok: "#22C55E",
  warn: "#F59E0B",
  danger: "#EF4444",
};

const Pill = ({ children, color = COLORS.text2 }) => (
  <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold"
        style={{ backgroundColor: "rgba(255,255,255,0.06)", color, border: `1px solid ${COLORS.ring}` }}>
    {children}
  </span>
);

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

const EventDetails = ({ item, onClose, onEdit, onSetStatus, onSaveReplay, onCheckin, onExportOne }) => {
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState("overview");
  const [replay, setReplay] = useState("");

  useEffect(() => { setMounted(true); return () => setMounted(false); }, []);
  useEffect(() => {
    if (!item) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [item]);

  useEffect(() => {
    setTab("overview");
    setReplay(item?.replayUrl || "");
  }, [item]);

  if (!item || !mounted) return null;

  const isLive = item.status === "Live";
  const isEnded = item.status === "Ended";

  const startLive = () => onSetStatus?.(item.id, "Live");
  const endLive = () => onSetStatus?.(item.id, "Ended");
  const saveReplay = () => {
    onSaveReplay?.(item.id, replay);
    alert("Replay attached.");
  };

  const registrants = item.metrics?.registrants || (item.attendees?.length ?? 0);
  const attendees = item.metrics?.attendees || (item.attendees?.filter((a)=>a.checkedIn).length ?? 0);
  const checkinRate = registrants ? Math.round((attendees/registrants)*100) : 0;

  // eslint-disable-next-line no-unused-vars
  const checkinCode = (att) => `${item.id}:${att.id}`;

  return createPortal(
    <>
      <div className="fixed inset-0 z-[1999]" onClick={onClose} style={{ backgroundColor: "rgba(0,0,0,0.55)" }} />
      <aside className="fixed inset-y-0 right-0 w-[560px] max-w-[96vw] z-[2000] overflow-y-auto"
             style={{ backgroundColor: COLORS.bg2, borderLeft: `1px solid ${COLORS.ring}` }}>
        {/* Header */}
        <div className="p-4 sticky top-0 flex items-center justify-between"
             style={{ backgroundColor: COLORS.bg2, borderBottom: `1px solid ${COLORS.ring}` }}>
          <div>
            <div className="text-sm font-semibold" style={{ color: COLORS.text }}>
              {item.title}
            </div>
            <div className="text-xs" style={{ color: COLORS.text2 }}>
              {new Date(item.start).toLocaleString()} • {item.mode === "virtual" ? "Virtual" : item.location || "In-person"}
            </div>
          </div>
          <button className="p-2 rounded-lg" onClick={onClose} aria-label="Close" style={{ color: COLORS.text2 }}>
            <IoClose size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-4 pt-3 pb-2 flex flex-wrap gap-2">
          <TabBtn active={tab === "overview"} onClick={() => setTab("overview")}>Overview</TabBtn>
          <TabBtn active={tab === "live"} onClick={() => setTab("live")}>Live Controls</TabBtn>
          <TabBtn active={tab === "attendees"} onClick={() => setTab("attendees")}>Attendees</TabBtn>
          <TabBtn active={tab === "post"} onClick={() => setTab("post")}>Post-Event</TabBtn>
          <TabBtn active={tab === "stats"} onClick={() => setTab("stats")}>Stats</TabBtn>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {/* Overview */}
          {tab === "overview" && (
            <div className="rounded-2xl p-4 space-y-3"
                 style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.ring}`, color: COLORS.text }}>
              <div className="flex flex-wrap items-center gap-2">
                <Pill color={ item.status==="Live" ? COLORS.ok : item.status==="Scheduled" ? COLORS.warn : COLORS.text2 }>
                  {item.status}
                </Pill>
                <Pill>{item.type}</Pill>
                <Pill>{item.category}</Pill>
                <Pill>{(item.tiers||[]).join(", ") || "All tiers"}</Pill>
              </div>
              <div className="text-sm" style={{ color: COLORS.text2 }}>{item.description || "No description."}</div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span style={{ color: COLORS.text2 }}>Host:</span> {item.host || "—"}</div>
                <div><span style={{ color: COLORS.text2 }}>Capacity:</span> {item.capacity || "—"}</div>
                {item.mode === "virtual" ? (
                  <>
                    <div className="truncate"><span style={{ color: COLORS.text2 }}>Join:</span> {item.joinUrl || "—"}</div>
                    <div className="truncate"><span style={{ color: COLORS.text2 }}>RTMP:</span> {item.rtmpUrl || "—"}</div>
                  </>
                ) : (
                  <div className="col-span-2 truncate"><span style={{ color: COLORS.text2 }}>Location:</span> {item.location || "—"}</div>
                )}
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  className="px-3 py-2 rounded-xl text-sm font-medium inline-flex items-center gap-2"
                  style={{ backgroundColor: "#12131A", border: `1px solid ${COLORS.ring}`, color: COLORS.text }}
                  onClick={onExportOne}
                >
                  <MdDownload /> Export
                </button>
                <button
                  className="px-3 py-2 rounded-xl text-sm font-medium inline-flex items-center gap-2"
                  style={{ background: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.purple})`, color: "#0B0B0F" }}
                  onClick={onEdit}
                >
                  <MdEdit /> Edit
                </button>
              </div>
            </div>
          )}

          {/* Live Controls */}
          {tab === "live" && (
            <div className="rounded-2xl p-4 space-y-4"
                 style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.ring}`, color: COLORS.text }}>
              <div className="flex flex-wrap items-center gap-2">
                <Pill>{item.chatEnabled ? "Chat: On" : "Chat: Off"}</Pill>
                <Pill>{item.qnaEnabled ? "Q&A: On" : "Q&A: Off"}</Pill>
                <Pill>{item.recordEnabled ? "Record: On" : "Record: Off"}</Pill>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {!isLive && !isEnded && (
                  <button
                    className="px-3 py-2 rounded-xl text-sm font-medium inline-flex items-center gap-2"
                    style={{ background: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.purple})`, color: "#0B0B0F" }}
                    onClick={startLive}
                  >
                    <MdPlayCircle /> Start Live
                  </button>
                )}
                {isLive && (
                  <button
                    className="px-3 py-2 rounded-xl text-sm font-medium inline-flex items-center gap-2"
                    style={{ backgroundColor: "#2A1014", color: "#fff", border: "1px solid rgba(239,68,68,0.4)" }}
                    onClick={endLive}
                  >
                    <MdStopCircle /> End Live
                  </button>
                )}
                <button
                  className="px-3 py-2 rounded-xl text-sm font-medium inline-flex items-center gap-2"
                  style={{ backgroundColor: "#12131A", border: `1px solid ${COLORS.ring}`, color: COLORS.text }}
                  onClick={() => alert("Notify registrants (placeholder)")}
                >
                  <MdSend /> Send Reminder
                </button>
              </div>

              <div>
                <div className="text-xs mb-2" style={{ color: COLORS.text2 }}>Participants</div>
                <div className="space-y-2">
                  {(item.participants||[]).map((p) => (
                    <div key={p.id} className="flex items-center justify-between">
                      <div className="text-sm">{p.name}</div>
                      <button
                        className="px-2 py-1 rounded-md text-xs font-semibold"
                        style={{ backgroundColor: "#12131A", border: `1px solid ${COLORS.ring}`, color: COLORS.text }}
                        onClick={() => alert("Kick (placeholder)")}
                      >
                        Kick
                      </button>
                    </div>
                  ))}
                  {!item.participants?.length && (
                    <div className="text-sm" style={{ color: COLORS.text2 }}>No participants yet.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Attendees & QR/Check-in */}
          {tab === "attendees" && (
            <div className="rounded-2xl p-4 space-y-3"
                 style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.ring}`, color: COLORS.text }}>
              <div className="text-xs" style={{ color: COLORS.text2 }}>
                Tap code to copy (use as QR payload in scanner app).
              </div>
              <div className="space-y-2">
                {(item.attendees||[]).map((a) => (
                  <div key={a.id} className="flex items-center justify-between gap-2">
                    <div>
                      <div className="text-sm">{a.name}</div>
                      <div className="text-xs" style={{ color: COLORS.text2 }}>{a.email}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="px-2 py-1 rounded-md text-xs font-semibold inline-flex items-center gap-1"
                        style={{ backgroundColor: "#12131A", border: `1px solid ${COLORS.ring}`, color: COLORS.text2 }}
                        onClick={() => {
                          const payload = `${item.id}:${a.id}`;
                          navigator.clipboard?.writeText?.(payload);
                          alert("Check-in code copied.");
                        }}
                        title="Copy check-in code"
                      >
                        <MdQrCode2 /> Code
                      </button>
                      <button
                        className="px-2 py-1 rounded-md text-xs font-semibold"
                        style={{
                          backgroundColor: a.checkedIn ? "rgba(34,197,94,0.15)" : "#12131A",
                          color: a.checkedIn ? COLORS.ok : COLORS.text,
                          border: `1px solid ${COLORS.ring}`,
                        }}
                        onClick={() => onCheckin?.(item.id, a.id, !a.checkedIn)}
                      >
                        {a.checkedIn ? "Checked-in" : "Check-in"}
                      </button>
                    </div>
                  </div>
                ))}
                {!item.attendees?.length && (
                  <div className="text-sm" style={{ color: COLORS.text2 }}>No attendees yet.</div>
                )}
              </div>
            </div>
          )}

          {/* Post-Event */}
          {tab === "post" && (
            <div className="rounded-2xl p-4 space-y-3"
                 style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.ring}`, color: COLORS.text }}>
              <div>
                <label className="text-xs" style={{ color: COLORS.text2 }}>Replay URL</label>
                <input
                  value={replay}
                  onChange={(e) => setReplay(e.target.value)}
                  className="mt-1 w-full rounded-lg px-3 py-2 text-sm outline-none"
                  style={{ backgroundColor: "#12131A", color: COLORS.text, border: `1px solid ${COLORS.ring}` }}
                  placeholder="https://cdn…/replay.mp4"
                />
                <div className="mt-2 flex items-center gap-2">
                  <button
                    className="px-3 py-2 rounded-xl text-sm font-medium"
                    style={{ backgroundColor: "#12131A", border: `1px solid ${COLORS.ring}`, color: COLORS.text }}
                    onClick={saveReplay}
                  >
                    Attach Replay
                  </button>
                  <button
                    className="px-3 py-2 rounded-xl text-sm font-medium"
                    style={{ background: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.purple})`, color: "#0B0B0F" }}
                    onClick={() => alert("Notify registrants (placeholder)")}
                  >
                    Notify Registrants
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <div className="text-xs" style={{ color: COLORS.text2 }}>Feedback</div>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    className="px-3 py-2 rounded-xl text-sm font-medium"
                    style={{ backgroundColor: "#12131A", border: `1px solid ${COLORS.ring}`, color: COLORS.text }}
                    onClick={() => alert("Open feedback form (placeholder)")}
                  >
                    Open Feedback Form
                  </button>
                  <button
                    className="px-3 py-2 rounded-xl text-sm font-medium"
                    style={{ backgroundColor: "#12131A", border: `1px solid ${COLORS.ring}`, color: COLORS.text }}
                    onClick={() => alert("Export feedback CSV (placeholder)")}
                  >
                    Export Feedback
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Stats */}
          {tab === "stats" && (
            <div className="rounded-2xl p-4 space-y-3"
                 style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.ring}`, color: COLORS.text }}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl p-3" style={{ backgroundColor: "#0F1118", border: `1px solid ${COLORS.ring}` }}>
                  <div className="text-xs" style={{ color: COLORS.text2 }}>Registrants</div>
                  <div className="text-lg font-semibold">{registrants}</div>
                </div>
                <div className="rounded-xl p-3" style={{ backgroundColor: "#0F1118", border: `1px solid ${COLORS.ring}` }}>
                  <div className="text-xs" style={{ color: COLORS.text2 }}>Attendees</div>
                  <div className="text-lg font-semibold">{attendees}</div>
                </div>
                <div className="rounded-xl p-3" style={{ backgroundColor: "#0F1118", border: `1px solid ${COLORS.ring}` }}>
                  <div className="text-xs" style={{ color: COLORS.text2 }}>Check-in Rate</div>
                  <div className="text-lg font-semibold">{checkinRate}%</div>
                </div>
                <div className="rounded-xl p-3" style={{ backgroundColor: "#0F1118", border: `1px solid ${COLORS.ring}` }}>
                  <div className="text-xs" style={{ color: COLORS.text2 }}>
                    {item.type === "live" ? "Avg Watch (min)" : "Messages"}
                  </div>
                  <div className="text-lg font-semibold">
                    {item.type === "live" ? (item.metrics?.avgWatchMins || 0) : (item.metrics?.chatMessages || 0)}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  className="px-3 py-2 rounded-xl text-sm font-medium inline-flex items-center gap-2"
                  style={{ backgroundColor: "#12131A", border: `1px solid ${COLORS.ring}`, color: COLORS.text }}
                  onClick={onExportOne}
                >
                  <MdDownload /> Export Analytics
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>,
    document.body
  );
};

export default EventDetails;
