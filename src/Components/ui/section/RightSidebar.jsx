import React from "react";
import { IoClose, IoCameraOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

const COLORS = {
  bg: "#0B0B0F",
  bg2: "#12131A",
  card: "#161821",
  text: "#E6E8F0",
  text2: "#A3A7B7",
  gold: "#D4AF37",
  purple: "#6E56CF",
  ring: "rgba(110,86,207,0.25)",
};

/* ---- mock data ---- */
const Notifications = [
  { id: 1, title: "Payment Received", desc: "Payment made by a user" },
  { id: 2, title: "Payment Received", desc: "Payment made by a user" },
  { id: 3, title: "Payment Received", desc: "Payment made by a user" },
];

const messages = [
  {
    id: 1,
    name: "Alex Benjamin",
    text: "Hi Buddy!👋",
    avatar: "https://i.pravatar.cc/64?img=11",
    unread: 1,
  },
  {
    id: 2,
    name: "Jerry Maguire",
    text: "Hi Buddy!👋",
    avatar: "https://i.pravatar.cc/64?img=12",
    unread: 1,
  },
  {
    id: 3,
    name: "Jane Smith",
    text: "Hi Buddy!👋",
    avatar: "https://i.pravatar.cc/64?img=13",
    unread: 1,
  },
];

const contacts = [
  { id: 1, name: "Alex Benjamin", avatar: "https://i.pravatar.cc/64?img=11" },
  { id: 2, name: "Jerry Maguire", avatar: "https://i.pravatar.cc/64?img=12" },
  { id: 3, name: "Jane Smith", avatar: "https://i.pravatar.cc/64?img=13" },
];

const RightSidebar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();

  return (
    <>
      {/* mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[90] lg:hidden"
          onClick={() => setIsOpen(false)}
          style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
        />
      )}

      {/* panel */}


      {/* <aside
        className={`fixed lg:static inset-y-0 right-0 w-72 sm:w-80 z-[1001]
        transform transition-transform duration-200 ease-in-out
        ${isOpen ? "translate-x-0" : "translate-x-full"} lg:translate-x-0`}
        style={{
          backgroundColor: COLORS.bg2,
          borderLeft: `1px solid ${COLORS.ring}`,
          color: COLORS.text,
        }}
      >
        <button
          className="absolute top-3 right-3 p-2 rounded-lg lg:hidden transition"
          onClick={() => setIsOpen(false)}
          aria-label="Close"
          style={{ color: COLORS.text2, backgroundColor: "transparent" }}
        >
          <IoClose size={20} />
        </button> */}

        {/* <div className="h-full overflow-y-auto p-4 space-y-6"> */}
          {/* Notifications */}
          {/* <section>
            <h3 className="text-[15px] font-semibold" style={{ color: COLORS.text }}>
              Notifications
            </h3>
            <div className="mt-3 space-y-3">
              {Notifications.map((n) => (
                <div
                  key={n.id}
                  className="flex gap-3 rounded-xl p-2"
                  style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.ring}` }}
                >
                  <span
                    className="h-10 w-10 rounded-xl grid place-items-center shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${COLORS.gold}, ${COLORS.purple})`,
                      color: COLORS.bg,
                    }}
                  >
                    <IoCameraOutline size={20} />
                  </span>
                  <div className="flex-1">
                    <div className="text-[14px] font-medium" style={{ color: COLORS.text }}>
                      {n.title}
                    </div>
                    <div className="text-xs" style={{ color: COLORS.text2 }}>
                      {n.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4" style={{ height: 1, backgroundColor: COLORS.card }} />
          </section> */}

          {/* Messages */}
          {/* <section>
            <div className="flex items-center justify-between">
              <h3 className="text-[15px] font-semibold" style={{ color: COLORS.text }}>
                Messages
              </h3>
              <button
                className="text-xs font-medium hover:underline"
                onClick={() => {
                  navigate("/messages");
                  setIsOpen?.(false);
                }}
                style={{
                  background: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.purple})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Show All
              </button>
            </div>

            <div className="mt-3 space-y-3" role="list">
              {messages.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  role="listitem"
                  onClick={() => {
                    navigate(`/messages/${m.id}`);
                    setIsOpen?.(false);
                  }}
                  className="w-full flex items-center justify-between rounded-lg p-2 text-left transition"
                  aria-label={`Open chat with ${m.name}`}
                  style={{
                    backgroundColor: COLORS.card,
                    border: `1px solid ${COLORS.ring}`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={m.avatar}
                      alt={m.name}
                      className="h-9 w-9 rounded-full object-cover"
                    />
                    <div>
                      <div className="text-sm font-medium" style={{ color: COLORS.text }}>
                        {m.name}
                      </div>
                      <div className="text-xs" style={{ color: COLORS.text2 }}>
                        {m.text}
                      </div>
                    </div>
                  </div>

                  {m.unread ? (
                    <span
                      className="h-5 w-5 rounded-full grid place-items-center text-[11px] font-semibold"
                      style={{
                        background: `linear-gradient(135deg, ${COLORS.purple}, ${COLORS.gold})`,
                        color: COLORS.bg,
                      }}
                    >
                      {m.unread}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>

            <div className="mt-4" style={{ height: 1, backgroundColor: COLORS.card }} />
          </section> */}

          {/* Contacts */}
          {/* <section>
            <div className="flex items-center justify-between">
              <h3 className="text-[15px] font-semibold" style={{ color: COLORS.text }}>
                Contacts
              </h3>
              <button
                className="text-xs font-medium hover:underline"
                style={{
                  background: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.purple})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Show All
              </button>
            </div> */}

            {/* <div className="mt-3 space-y-3">
              {contacts.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-3 rounded-lg p-2"
                  style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.ring}` }}
                >
                  <img
                    src={c.avatar}
                    alt={c.name}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                  <div className="text-sm font-medium" style={{ color: COLORS.text }}>
                    {c.name}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div> */}
      {/* </aside> */}

    
      
    </>
  );
};

export default RightSidebar;
