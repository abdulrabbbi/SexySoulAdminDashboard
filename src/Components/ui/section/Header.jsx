import React from "react";
import { Link, useLocation } from "react-router-dom";
import { MdMenu, MdSearch, MdNotificationsNone } from "react-icons/md";

const COLORS = {
  bg: "#0B0B0F",       // Onyx
  bg2: "#12131A",      // Charcoal
  card: "#161821",     // Card
  text: "#E6E8F0",     // Primary
  text2: "#A3A7B7",    // Secondary
  gold: "#D4AF37",     // Luxe Gold
  purple: "#6E56CF",   // Royal Purple
  ring: "rgba(110,86,207,0.35)",
};

const Header = ({ onMenuClick, onNotificationClick }) => {
  const { pathname } = useLocation();
  const pageName =
    pathname === "/"
      ? "Default"
      : pathname.split("/").filter(Boolean).pop()?.replace(/-/g, " ") || "Default";

  return (
    <div className="px-3 md:px-4 pt-3">
      <header
        className="h-14 w-full rounded-2xl shadow-sm flex items-center gap-3 px-3 md:px-4 border"
        style={{
          backgroundColor: COLORS.card,
          borderColor: "rgba(110,86,207,0.25)",
        }}
      >
        {/* Mobile menu */}
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg lg:hidden transition"
          style={{ color: COLORS.text, backgroundColor: "transparent" }}
          aria-label="Open menu"
        >
          <MdMenu size={18} />
        </button>

        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm">
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg transition"
            aria-label="Toggle left sidebar"
            title="Toggle left sidebar"
            style={{ color: COLORS.text2, backgroundColor: "transparent" }}
          >
            <img
              src="/assets/Sidebar%20Left.png"
              alt="Left sidebar"
              className="h-6 w-6 opacity-80"
            />
          </button>

          <Link
            to="/"
            className="font-medium hover:underline"
            style={{ background: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.purple})`,
                     WebkitBackgroundClip: "text",
                     WebkitTextFillColor: "transparent" }}
          >
            Dashboard
          </Link>

          <span style={{ color: "#2A2C38" }}>/</span>
          <span className="capitalize" style={{ color: COLORS.text2 }}>
            {pageName}
          </span>
        </div>

        <div className="flex-1" />

        {/* Search + actions */}
        <div className="hidden md:flex items-center gap-3">
          {/* <div className="relative">
            <MdSearch
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: COLORS.text2 }}
            />
            <input
              type="text"
              placeholder="Search"
              className="h-9 w-60 xl:w-80 rounded-full pl-9 pr-12 text-sm focus:outline-none"
              style={{
                backgroundColor: COLORS.bg2,
                color: COLORS.text,
                border: `1px solid ${COLORS.ring}`,
              }}
            />
            <kbd
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs pointer-events-none"
              style={{ color: COLORS.text2 }}
            >
              ⌘K
            </kbd>
          </div> */}

          {/* <button
            className="p-2 rounded-lg transition"
            onClick={onNotificationClick}
            aria-label="Notifications"
            style={{ color: COLORS.text, backgroundColor: "transparent" }}
          >
            <div className="relative">
              <MdNotificationsNone size={18} /> */}
              {/* dot */}
              {/* <span
                className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.purple})`,
                }}
              />
            </div>
          </button> */}

          <button
            type="button"
            className="p-2 rounded-lg transition"
            aria-label="Toggle right sidebar"
            title="Toggle right sidebar"
            style={{ color: COLORS.text, backgroundColor: "transparent" }}
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg">
              <img
                src="/assets/Sidebar%20Right.png"
                alt="Right sidebar"
                className="h-6 w-6 opacity-80"
              />
            </span>
          </button>
        </div>
      </header>
    </div>
  );
};

export default Header;
