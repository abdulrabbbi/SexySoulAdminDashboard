import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  MdPlayArrow,
  MdStop,
  MdMic,
  MdMicOff,
  MdVideocam,
  MdVideocamOff,
  MdScreenShare,
  MdStopScreenShare,
  MdRadioButtonChecked,
  MdRadioButtonUnchecked,
  MdContentCopy,
  MdPeople,
  MdChat,
  MdHelpOutline,
  MdSettings,
  MdArrowBack,
} from "react-icons/md";

const COLORS = {
  bg: "#12131A",
  surface: "#161821",
  text: "#E6E8F0",
  text2: "#A3A7B7",
  ring: "rgba(110,86,207,0.25)",
  gold: "#D4AF37",
  purple: "#6E56CF",
  success: "#22C55E",
  danger: "#EF4444",
};

function msToClock(ms) {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600)
    .toString()
    .padStart(2, "0");
  const m = Math.floor((total % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(total % 60)
    .toString()
    .padStart(2, "0");
  return `${h}:${m}:${s}`;
}

const IconButton = ({ active, title, onClick, children }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className={`h-10 px-3 rounded-xl text-sm font-medium inline-flex items-center gap-2 transition
      ${active ? "ring-2" : ""}`}
    style={{
      backgroundColor: "#12131A",
      color: COLORS.text,
      border: `1px solid ${COLORS.ring}`,
      ringColor: active ? COLORS.purple : undefined,
    }}
  >
    {children}
  </button>
);

/** Minimal chat bubble */
const Bubble = ({ me, name, text, time }) => (
  <div className={`flex ${me ? "justify-end" : "justify-start"}`}>
    <div
      className={`max-w-[85%] p-2 rounded-xl text-sm ${
        me ? "rounded-tr-sm" : "rounded-tl-sm"
      }`}
      style={{
        backgroundColor: me ? "#0B0B0F" : "#12131A",
        border: `1px solid ${COLORS.ring}`,
        color: COLORS.text,
      }}
    >
      {!me && (
        <div className="text-[11px] mb-0.5" style={{ color: COLORS.text2 }}>
          {name}
        </div>
      )}
      <div>{text}</div>
      <div className="text-[10px] mt-1" style={{ color: COLORS.text2 }}>
        {time}
      </div>
    </div>
  </div>
);

const mockParticipants = [
  { id: "host", name: "You (Host)", role: "host", muted: false, cam: true },
  { id: "p1", name: "Alex Benjamin", role: "vip", muted: true, cam: false },
  { id: "p2", name: "Jane Smith", role: "member", muted: false, cam: true },
  { id: "p3", name: "Jerry Maguire", role: "member", muted: true, cam: false },
];

const LiveStudio = () => {
  const navigate = useNavigate();
  const [search] = useSearchParams();

  // Stream state-machine: "preview" | "live" | "ended"
  const [status, setStatus] = useState("preview");
  const [mic, setMic] = useState(true);
  const [cam, setCam] = useState(true);
  const [screen, setScreen] = useState(false);
  const [recording, setRecording] = useState(false);

  // Session meta / settings
  const [title, setTitle] = useState("Founder AMA: Luxury Real Estate Q&A");
  const [rtmpUrl, setRtmpUrl] = useState("rtmp://live.example.com/app");
  const [streamKey, setStreamKey] = useState("ssl_live_XXXX-XXXX-XXXX");
  const [latency, setLatency] = useState("normal");
  const [allowChat, setAllowChat] = useState(true);
  const [allowQA, setAllowQA] = useState(true);

  // Timer for live session
  const [startedAt, setStartedAt] = useState(null);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const elapsed = useMemo(
    () => (status === "live" && startedAt ? now - startedAt : 0),
    [status, startedAt, now]
  );

  // Panels
  const [tab, setTab] = useState("chat"); // chat | qa | participants | settings

  // Chat/Q&A state
  const [chatInput, setChatInput] = useState("");
  const [chat, setChat] = useState([
    {
      id: 1,
      me: false,
      name: "Alex",
      text: "Excited for this session!",
      time: "10:21",
    },
    {
      id: 2,
      me: true,
      name: "You",
      text: "We’ll start in a minute 👋",
      time: "10:22",
    },
  ]);
  const [qa, setQa] = useState([
    {
      id: 10,
      name: "Jane",
      q: "Best cities for first real estate deal?",
      up: 12,
      answered: false,
    },
    {
      id: 11,
      name: "Jerry",
      q: "How to evaluate a distressed property?",
      up: 5,
      answered: false,
    },
  ]);
  const [participants, setParticipants] = useState(mockParticipants);

  // Stable refs (no conditional hooks)
  const videoRef = useRef(null);

  const startLive = () => {
    if (status !== "preview") return;
    setStatus("live");
    setStartedAt(Date.now());
  };
  const stopLive = () => {
    if (status !== "live") return;
    setStatus("ended");
    setRecording(false);
  };

  const endAndExit = () => {
    if (status === "live") {
      if (!confirm("End the live session? Recording will stop.")) return;
    }
    setStatus("ended");
    navigate("/"); // back to dashboard (or /events)
  };

  const copy = (value) => {
    navigator.clipboard.writeText(value);
    alert("Copied!");
  };

  const sendChat = () => {
    if (!chatInput.trim() || !allowChat) return;
    setChat((c) => [
      ...c,
      {
        id: Date.now(),
        me: true,
        name: "You",
        text: chatInput.trim(),
        time: new Date().toTimeString().slice(0, 5),
      },
    ]);
    setChatInput("");
  };

  const toggleParticipantMute = (id) => {
    setParticipants((ps) =>
      ps.map((p) => (p.id === id ? { ...p, muted: !p.muted } : p))
    );
  };
  const removeParticipant = (id) => {
    setParticipants((ps) => ps.filter((p) => p.id !== id));
  };

  // From param (?from=events) show a friendly hint (no hooks inside conditions)
  const from = search.get("from");

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.bg }}>
      {/* Top bar */}
      <div
        className="sticky top-0 z-40"
        style={{
          backgroundColor: COLORS.bg,
          borderBottom: `1px solid ${COLORS.ring}`,
        }}
      >
        <div className="mx-auto max-w-7xl px-3 md:px-6 py-3 flex items-center gap-3">
          <button
            type="button"
            className="h-9 w-9 grid place-items-center rounded-lg"
            style={{ border: `1px solid ${COLORS.ring}`, color: COLORS.text }}
            onClick={endAndExit}
            title="Back"
          >
            <MdArrowBack size={18} />
          </button>

          <div className="flex-1 min-w-0">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-10 rounded-xl px-3 text-sm outline-none"
              style={{
                backgroundColor: COLORS.surface,
                border: `1px solid ${COLORS.ring}`,
                color: COLORS.text,
              }}
              placeholder="Session title"
            />
          </div>

          <div
            className="px-3 py-1 rounded-xl text-xs font-semibold"
            style={{
              backgroundColor: status === "live" ? "#16251B" : "#1F1A23",
              border: `1px solid ${COLORS.ring}`,
              color: status === "live" ? COLORS.success : COLORS.text2,
            }}
          >
            {status === "live"
              ? `LIVE • ${msToClock(elapsed)}`
              : status.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-3 md:px-6 py-4 grid lg:grid-cols-[1fr_360px] gap-4">
        {/* Main video / preview */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            backgroundColor: COLORS.surface,
            border: `1px solid ${COLORS.ring}`,
          }}
        >
          <div className="aspect-video relative grid place-items-center">
            {/* Placeholder preview pane */}
            <div className="absolute inset-0 grid place-items-center">
              <div
                className="rounded-xl px-4 py-2 text-sm font-medium"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(230,232,240,0.06), rgba(230,232,240,0.03))",
                  border: `1px solid ${COLORS.ring}`,
                  color: COLORS.text2,
                }}
              >
                {cam ? "Camera Preview" : "Camera Off"} • Mic{" "}
                {mic ? "On" : "Muted"}
                {screen ? " • Screen Sharing" : ""}
              </div>
            </div>
            <video
              ref={videoRef}
              className="w-full h-full object-cover opacity-30"
            />
          </div>

          {/* Controls */}
          <div className="p-3 md:p-4 flex flex-wrap items-center justify-center gap-2">
            <IconButton
              title={mic ? "Mute mic" : "Unmute mic"}
              active={mic}
              onClick={() => setMic((m) => !m)}
            >
              {mic ? <MdMic /> : <MdMicOff />}
              {mic ? "Mic On" : "Mic Off"}
            </IconButton>

            <IconButton
              title={cam ? "Turn camera off" : "Turn camera on"}
              active={cam}
              onClick={() => setCam((c) => !c)}
            >
              {cam ? <MdVideocam /> : <MdVideocamOff />}
              {cam ? "Camera On" : "Camera Off"}
            </IconButton>

            <IconButton
              title={screen ? "Stop sharing" : "Share screen"}
              active={screen}
              onClick={() => setScreen((s) => !s)}
            >
              {screen ? <MdStopScreenShare /> : <MdScreenShare />}
              {screen ? "Stop Share" : "Share Screen"}
            </IconButton>

            <IconButton
              title={recording ? "Stop recording" : "Start recording"}
              active={recording}
              onClick={() => setRecording((r) => !r)}
            >
              {recording ? (
                <MdRadioButtonChecked />
              ) : (
                <MdRadioButtonUnchecked />
              )}
              {recording ? "Recording…" : "Record"}
            </IconButton>

            {status !== "live" ? (
              <button
                onClick={startLive}
                className="h-10 px-4 rounded-xl text-sm font-semibold"
                style={{
                  background: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.purple})`,
                  color: "#0B0B0F",
                }}
                title="Go Live"
              >
                Go Live
              </button>
            ) : (
              <button
                onClick={stopLive}
                className="h-10 px-4 rounded-xl text-sm font-semibold"
                style={{
                  backgroundColor: "#2A1214",
                  color: COLORS.text,
                  border: `1px solid rgba(239,68,68,0.5)`,
                }}
                title="Stop Live"
              >
                <MdStop className="inline -mt-0.5 mr-1" />
                Stop
              </button>
            )}
          </div>
        </div>

        {/* Right panel (responsive) */}
        <aside
          className=" py-5"
          role="complementary"
          aria-label="Live controls"
        >
          {/* Mobile Tab Select */}
          <div className="md:hidden mb-2">
            <label className="sr-only" htmlFor="live-tab">
              Panel
            </label>
            <select
              id="live-tab"
              value={tab}
              onChange={(e) => setTab(e.target.value)}
              className="w-full h-10 rounded-xl px-3 text-sm outline-none"
              style={{
                backgroundColor: COLORS.surface,
                border: `1px solid ${COLORS.ring}`,
                color: COLORS.text,
              }}
            >
              <option value="chat">Chat</option>
              <option value="qa">Q&amp;A</option>
              <option value="participants">Participants</option>
              <option value="settings">Settings</option>
            </select>
          </div>

          {/* Tabs (desktop) */}
          <div className="hidden md:flex items-center gap-2 mb-2 overflow-x-auto">
            {[
              { key: "chat", label: "Chat", Icon: MdChat },
              { key: "qa", label: "Q&A", Icon: MdHelpOutline },
              { key: "participants", label: "Participants", Icon: MdPeople },
              { key: "settings", label: "Settings", Icon: MdSettings },
            ].map(({ key, label }) => {
              const active = tab === key;
              return (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`h-9 px-3 rounded-xl text-sm font-medium inline-flex items-center gap-2 ${
                    active ? "ring-2" : ""
                  }`}
                  style={{
                    backgroundColor: COLORS.surface,
                    border: `1px solid ${COLORS.ring}`,
                    color: COLORS.text,
                  }}
                  aria-pressed={active}
                >
                  <Icon size={16} />
                  <span className="whitespace-nowrap">{label}</span>
                </button>
              );
            })}
          </div>

          {/* Panel body */}
          <div
            className="rounded-2xl p-3 md:p-4 overflow-hidden"
            style={{
              backgroundColor: COLORS.surface,
              border: `1px solid ${COLORS.ring}`,
              // Prevent giant panels on small screens, but allow room on desktop
              maxHeight: "70vh",
            }}
          >
            {/* CHAT */}
            {tab === "chat" && (
              <div className="flex flex-col h-[55vh] md:h-[420px] min-h-[260px]">
                <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1">
                  {chat.map((m) => (
                    <Bubble
                      key={m.id}
                      me={m.me}
                      name={m.name}
                      text={m.text}
                      time={m.time}
                    />
                  ))}
                </div>

                <div className="mt-3 flex items-center gap-2 pb-[env(safe-area-inset-bottom)]">
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={
                      allowChat ? "Type a message…" : "Chat disabled"
                    }
                    disabled={!allowChat}
                    className="flex-1 h-10 rounded-xl px-3 text-sm outline-none"
                    style={{
                      backgroundColor: "#12131A",
                      border: `1px solid ${COLORS.ring}`,
                      color: COLORS.text,
                    }}
                  />
                  <button
                    onClick={sendChat}
                    disabled={!allowChat}
                    className="h-10 px-3 rounded-xl text-sm font-semibold disabled:opacity-60"
                    style={{
                      background: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.purple})`,
                      color: "#0B0B0F",
                    }}
                  >
                    Send
                  </button>
                </div>
              </div>
            )}

            {/* Q&A */}
            {tab === "qa" && (
              <div className="space-y-3 overflow-y-auto max-h-[60vh] md:max-h-[420px] pr-1">
                {qa.map((q) => (
                  <div
                    key={q.id}
                    className="rounded-xl p-3"
                    style={{
                      backgroundColor: "#12131A",
                      border: `1px solid ${COLORS.ring}`,
                      color: COLORS.text,
                    }}
                  >
                    <div className="text-sm font-medium">{q.q}</div>
                    <div
                      className="mt-1 text-xs"
                      style={{ color: COLORS.text2 }}
                    >
                      Asked by {q.name} • Upvotes {q.up}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <button
                        className="h-8 px-3 rounded-lg text-xs font-semibold"
                        style={{
                          border: `1px solid ${COLORS.ring}`,
                          backgroundColor: COLORS.surface,
                          color: COLORS.text,
                        }}
                        onClick={() =>
                          setQa((list) =>
                            list.map((i) =>
                              i.id === q.id
                                ? { ...i, answered: !i.answered }
                                : i
                            )
                          )
                        }
                      >
                        {q.answered ? "Mark Unanswered" : "Mark Answered"}
                      </button>
                      <button
                        className="h-8 px-3 rounded-lg text-xs font-semibold"
                        style={{
                          border: `1px solid ${COLORS.ring}`,
                          backgroundColor: COLORS.surface,
                          color: COLORS.text,
                        }}
                        onClick={() =>
                          setQa((list) => list.filter((i) => i.id !== q.id))
                        }
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                ))}
                {qa.length === 0 && (
                  <div className="text-sm" style={{ color: COLORS.text2 }}>
                    No questions yet.
                  </div>
                )}
              </div>
            )}

            {/* PARTICIPANTS */}
            {tab === "participants" && (
              <div className="space-y-2 overflow-y-auto max-h-[60vh] md:max-h-[420px] pr-1">
                {participants.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-xl px-3 py-2"
                    style={{
                      backgroundColor: "#12131A",
                      border: `1px solid ${COLORS.ring}`,
                      color: COLORS.text,
                    }}
                  >
                    <div className="min-w-0 pr-3">
                      <div className="text-sm font-medium truncate">
                        {p.name}
                      </div>
                      <div className="text-xs" style={{ color: COLORS.text2 }}>
                        {p.role === "host"
                          ? "Host"
                          : p.role === "vip"
                          ? "VIP"
                          : "Member"}{" "}
                        • {p.muted ? "Muted" : "Unmuted"} •{" "}
                        {p.cam ? "Cam On" : "Cam Off"}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="h-9 px-3 rounded-xl text-xs font-semibold inline-flex items-center gap-2"
                        style={{
                          backgroundColor: "#12131A",
                          color: COLORS.text,
                          border: `1px solid ${COLORS.ring}`,
                        }}
                        onClick={() => toggleParticipantMute(p.id)}
                        title={
                          p.muted ? "Unmute participant" : "Mute participant"
                        }
                      >
                        {p.muted ? <MdMicOff /> : <MdMic />}
                        {p.muted ? "Unmute" : "Mute"}
                      </button>
                      {p.role !== "host" && (
                        <button
                          type="button"
                          className="h-9 px-3 rounded-xl text-xs font-semibold inline-flex items-center gap-2"
                          style={{
                            backgroundColor: "#12131A",
                            color: COLORS.text,
                            border: `1px solid ${COLORS.ring}`,
                          }}
                          onClick={() => removeParticipant(p.id)}
                          title="Remove participant"
                        >
                          <MdStop />
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* SETTINGS */}
            {tab === "settings" && (
              <div className="space-y-4 overflow-y-auto max-h-[60vh] md:max-h-[420px] pr-1">
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs" style={{ color: COLORS.text2 }}>
                      RTMP Server URL
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        value={rtmpUrl}
                        onChange={(e) => setRtmpUrl(e.target.value)}
                        className="flex-1 h-10 rounded-xl px-3 text-sm outline-none"
                        style={{
                          backgroundColor: "#12131A",
                          border: `1px solid ${COLORS.ring}`,
                          color: COLORS.text,
                        }}
                      />
                      <button
                        type="button"
                        className="h-10 px-3 rounded-xl"
                        style={{
                          border: `1px solid ${COLORS.ring}`,
                          backgroundColor: "#12131A",
                          color: COLORS.text,
                        }}
                        onClick={() => copy(rtmpUrl)}
                        title="Copy RTMP URL"
                      >
                        <MdContentCopy />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs" style={{ color: COLORS.text2 }}>
                      Stream Key
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        value={streamKey}
                        onChange={(e) => setStreamKey(e.target.value)}
                        className="flex-1 h-10 rounded-xl px-3 text-sm outline-none"
                        style={{
                          backgroundColor: "#12131A",
                          border: `1px solid ${COLORS.ring}`,
                          color: COLORS.text,
                        }}
                      />
                      <button
                        type="button"
                        className="h-10 px-3 rounded-xl"
                        style={{
                          border: `1px solid ${COLORS.ring}`,
                          backgroundColor: "#12131A",
                          color: COLORS.text,
                        }}
                        onClick={() => copy(streamKey)}
                        title="Copy Stream Key"
                      >
                        <MdContentCopy />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs" style={{ color: COLORS.text2 }}>
                      Latency
                    </label>
                    <select
                      value={latency}
                      onChange={(e) => setLatency(e.target.value)}
                      className="mt-1 w-full h-10 rounded-xl px-3 text-sm outline-none"
                      style={{
                        backgroundColor: "#12131A",
                        border: `1px solid ${COLORS.ring}`,
                        color: COLORS.text,
                      }}
                    >
                      <option value="low">Low (near real-time)</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={allowChat}
                        onChange={(e) => setAllowChat(e.target.checked)}
                        className="accent-[#6E56CF]"
                      />
                      <span style={{ color: COLORS.text2 }}>Enable Chat</span>
                    </label>
                  </div>

                  <div className="flex items-end">
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={allowQA}
                        onChange={(e) => setAllowQA(e.target.checked)}
                        className="accent-[#6E56CF]"
                      />
                      <span style={{ color: COLORS.text2 }}>
                        Enable Q&amp;A
                      </span>
                    </label>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-2">
                  <button
                    className="h-10 px-4 rounded-xl text-sm font-semibold"
                    style={{
                      background: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.purple})`,
                      color: "#0B0B0F",
                    }}
                    onClick={() =>
                      alert("Replay attached to Library (placeholder)")
                    }
                  >
                    Attach Replay to Library
                  </button>
                  <button
                    className="h-10 px-4 rounded-xl text-sm font-semibold"
                    style={{
                      border: `1px solid ${COLORS.ring}`,
                      backgroundColor: "#12131A",
                      color: COLORS.text,
                    }}
                    onClick={() =>
                      alert("Reminder sent to registrants (placeholder)")
                    }
                  >
                    Notify Registrants
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* From hint */}
          {from && (
            <div
              className="mt-3 rounded-xl px-3 py-2 text-xs"
              style={{
                backgroundColor: "#12131A",
                border: `1px solid ${COLORS.ring}`,
                color: COLORS.text2,
              }}
            >
              Opened from: <span className="font-semibold">{from}</span>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default LiveStudio;
