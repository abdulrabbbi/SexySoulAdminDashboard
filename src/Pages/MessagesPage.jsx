// MessagesPage.jsx
import React, { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiSearch, FiSend } from "react-icons/fi";

/* --------------------------- Demo data (dynamic-ready) --------------------------- */
const THREADS = [
  {
    id: "alex",
    user: {
      name: "Alex Benjamin",
      avatar: "https://i.pravatar.cc/80?img=11",
      online: true,
    },
    preview: "Hi Buddy!👋",
    time: "12:00 PM",
    unread: 1,
    messages: [
      {
        id: "m1",
        from: "me",
        text:
          "Lorem ipsum dolor sit amet consectetur. Feugiat integer semper purus in et molestie facilisis. Hac vel vitae neque nec eu sed.",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: "m2",
        from: "them",
        text:
          "Lorem ipsum dolor sit amet consectetur. Feugiat integer purus in et molestie facilisis. Hac vel vitae neque nec eu sed.",
        timestamp: new Date(Date.now() - 1800000).toISOString(),
      },
      {
        id: "m3",
        from: "me",
        text:
          "Lorem ipsum dolor sit amet consectetur. Feugiat integer semper purus in et molestie facilisis. Hac vel vitae neque nec eu sed.",
        timestamp: new Date(Date.now() - 900000).toISOString(),
      },
      {
        id: "m4",
        from: "them",
        text:
          "Lorem ipsum dolor sit amet consectetur. Feugiat integer purus in et molestie facilisis. Hac vel vitae neque nec eu sed.",
        timestamp: new Date(Date.now() - 600000).toISOString(),
      },
    ],
  },
  {
    id: "jerry",
    user: {
      name: "Jerry Maguire",
      avatar: "https://i.pravatar.cc/80?img=12",
      online: false,
    },
    preview: "Hi Buddy!👋",
    time: "12:00 PM",
    unread: 1,
    messages: [
      {
        id: "m1",
        from: "them",
        text: "Hey there!",
        timestamp: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: "m2",
        from: "me",
        text: "All good 👌",
        timestamp: new Date(Date.now() - 82800000).toISOString(),
      },
    ],
  },
  {
    id: "jane",
    user: {
      name: "Jane Smith",
      avatar: "https://i.pravatar.cc/80?img=13",
      online: false,
    },
    preview: "Hi Buddy!👋",
    time: "12:00 PM",
    unread: 1,
    messages: [
      {
        id: "m1",
        from: "them",
        text: "Ping!",
        timestamp: new Date(Date.now() - 172800000).toISOString(),
      },
    ],
  },
];

/* ---------------------------------- UI atoms ---------------------------------- */
const Pill = ({ children, className = "" }) => (
  <span className={`inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full text-[11px] font-semibold ${className}`}>
    {children}
  </span>
);

const ChatBubble = ({ side = "left", children }) => {
  const isLeft = side === "left";
  return (
    <div className={`flex ${isLeft ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[70%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
          isLeft ? "bg-gray-100 text-gray-700" : "bg-[#7C5AC2] text-white"
        }`}
      >
        {children}
      </div>
    </div>
  );
};

/* --------------------------------- Utilities --------------------------------- */
const formatTime = (timestamp) =>
  new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const formatDate = (timestamp) => {
  const now = new Date();
  const date = new Date(timestamp);
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return formatTime(timestamp);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return date.toLocaleDateString([], { weekday: "short" });
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
};

const generateId = () => Math.random().toString(36).substring(2, 9);

/* --------------------------------- Page body ---------------------------------- */
const MessagesPage = () => {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const [threads, setThreads] = useState(THREADS);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const active = useMemo(() => {
    const idx = threads.findIndex((t) => t.id === threadId);
    return threads[idx >= 0 ? idx : 0];
  }, [threads, threadId]);

  // Filter threads based on search query
  const filteredThreads = useMemo(() => {
    if (!searchQuery) return threads;
    return threads.filter(
      (thread) =>
        thread.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        thread.preview.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [threads, searchQuery]);

  // mark unread as read when opening
  useEffect(() => {
    if (!active) return;
    setThreads((prev) => prev.map((t) => (t.id === active.id ? { ...t, unread: 0 } : t)));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.id]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [active?.messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !active) return;

    const message = {
      id: generateId(),
      from: "me",
      text: newMessage,
      timestamp: new Date().toISOString(),
    };

    setThreads((prev) =>
      prev.map((thread) =>
        thread.id === active.id
          ? {
              ...thread,
              messages: [...thread.messages, message],
              preview: newMessage,
              time: formatTime(new Date()),
            }
          : thread
      )
    );
    setNewMessage("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSendMessage();
  };

  // Simulate receiving messages (for demo purposes)
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7 && threads.length > 0) {
        const randomThreadIndex = Math.floor(Math.random() * threads.length);
        const thread = threads[randomThreadIndex];

        // Only send to a non-active thread so unread pill shows like mock
        if (thread.id !== active?.id) {
          const incoming = {
            id: generateId(),
            from: "them",
            text: "This is an automated reply!",
            timestamp: new Date().toISOString(),
          };

          setThreads((prev) =>
            prev.map((t) =>
              t.id === thread.id
                ? {
                    ...t,
                    messages: [...t.messages, incoming],
                    preview: incoming.text,
                    time: formatTime(new Date()),
                    unread: (t.unread || 0) + 1,
                  }
                : t
            )
          );
        }
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [threads, active?.id]);

  if (!active) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-3 sm:p-4">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-[300px,1fr] gap-4 p-3 sm:p-4">
          {/* LEFT: Thread list */}
          <aside className="bg-gray-50 rounded-xl p-4">
            <h2 className="text-[18px] font-semibold text-[#7C5AC2]">Messages</h2>
            <p className="text-xs text-gray-400 mt-1">All your messages are listed bellow</p>

            <div className="relative mt-4 mb-3">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations"
                className="w-full h-9 rounded-full bg-gray-100 pl-9 pr-3 text-sm outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="space-y-2 overflow-y-auto max-h-[65vh] pr-1">
              {filteredThreads.map((t) => {
                const isActive = active?.id === t.id;
                const lastTs = t.messages[t.messages.length - 1]?.timestamp;
                return (
                  <button
                    key={t.id}
                    onClick={() => navigate(`/messages/${t.id}`)}
                    className={`w-full grid grid-cols-[auto,1fr,auto] items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-white ${
                      isActive ? "bg-white shadow ring-1 ring-gray-200" : ""
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={t.user.avatar}
                        alt={t.user.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      {t.user.online && (
                        <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-white"></span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="font-medium text-sm text-gray-900 truncate">{t.user.name}</div>
                      <div className="text-[12px] text-gray-400 truncate">{t.preview}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400 whitespace-nowrap">
                        {formatDate(lastTs || t.time)}
                      </span>
                      {t.unread > 0 && <Pill className="bg-pink-500 text-white">{t.unread}</Pill>}
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* RIGHT: Conversation */}
          <section className="rounded-xl">
            {/* Header */}
            <div className="rounded-xl border border-gray-200 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={active.user.avatar}
                    alt={active.user.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  {active.user.online && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white"></span>
                  )}
                </div>
                <div>
                  <div className="font-semibold">{active.user.name}</div>
                  <div className="text-xs text-emerald-500 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    {active.user.online ? "Online" : "Offline"}
                  </div>
                </div>
              </div>

              {/* Only search icon (no input) to match mock */}
              <button className="p-2 rounded-full hover:bg-gray-100" title="Search in conversation">
                <FiSearch className="text-gray-400" size={18} />
              </button>
            </div>

            {/* Messages area */}
            <div className="mt-4 bg-white rounded-xl border border-gray-200 p-4 space-y-8 h-[56vh] overflow-y-auto">
              {active.messages.map((m, idx) => {
                const isMe = m.from === "me";
                const showAvatar =
                  !isMe &&
                  (idx === active.messages.length - 1 ||
                    active.messages[idx + 1].from !== m.from);

                return (
                  <div key={m.id} className="flex items-end gap-2">
                    {/* Left avatar only for 'them' at end of a block */}
                    {!isMe && showAvatar ? (
                      <img
                        src={active.user.avatar}
                        alt="avatar"
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      !isMe && <div className="w-6" />
                    )}

                    <div className="flex-1">
                      <ChatBubble side={isMe ? "right" : "left"}>{m.text}</ChatBubble>
                      <div
                        className={`text-xs text-gray-400 mt-1 ${
                          isMe ? "text-right" : "text-left"
                        }`}
                      >
                        {formatTime(m.timestamp)}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Composer */}
            <div className="mt-4 flex items-center gap-3">
              <input
                placeholder="Enter your message here ………"
                className="flex-1 h-11 rounded-xl bg-gray-100 px-4 text-sm outline-none"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                className="h-11 w-11 rounded-full bg-[#7C5AC2] text-white grid place-items-center disabled:opacity-50 hover:bg-[#6a4aaf] transition-colors"
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                title="Send"
              >
                <FiSend />
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
