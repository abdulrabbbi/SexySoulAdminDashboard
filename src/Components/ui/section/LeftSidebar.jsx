import {
  MdDashboard,
  MdPeople,
  MdLibraryBooks,
  MdEvent,
  MdLocalOffer,
  MdSupervisedUserCircle,
  MdCampaign,
  MdSettings,
  MdLogout,
} from "react-icons/md";
import { useLocation, Link } from "react-router-dom";
import { IoClose } from "react-icons/io5";
import React from "react";

/**
 * Luxe Dark Theme Tokens (from your spec)
 */
const COLORS = {
  bg: "#0B0B0F", // Onyx
  bg2: "#12131A", // Charcoal
  card: "#161821", // Card
  text: "#E6E8F0", // Primary text
  text2: "#A3A7B7", // Secondary text
  gold: "#D4AF37", // Luxe Gold
  purple: "#6E56CF", // Royal Purple
  ring: "rgba(110,86,207,0.35)",
};

const menuItems = [
  { icon: MdDashboard, label: "Dashboard", path: "/" },
  { icon: MdPeople, label: "Users & Memberships", path: "/users-memberships" },
  { icon: MdLibraryBooks, label: "Content", path: "/content" },
  { icon: MdEvent, label: "Live & Events", path: "/live-events" },
  { icon: MdLocalOffer, label: "Deals & Partners (PTM)", path: "/deals" },
  // {
  //   icon: MdSupervisedUserCircle,
  //   label: "Brokers & Referrals",
  //   path: "/brokers",
  // },
  // { icon: MdCampaign, label: "Messaging & Community", path: "/messaging" },
  {
    icon: MdSettings,
    label: "Support / Media / Settings",
    path: "/support-settings",
  },
];

const LeftSidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const isMatch = (p) =>
    p === "/" ? location.pathname === "/" : location.pathname.startsWith(p);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 lg:hidden"
          style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 w-64 z-40 transform
        ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
        transition-transform duration-200 ease-in-out flex flex-col`}
        style={{
          backgroundColor: COLORS.bg,
          borderRight: `1px solid ${COLORS.card}`,
        }}
      >
        {/* Logo / Brand */}
        <div
          className="h-16 px-6 flex items-center justify-between"
          style={{ backgroundColor: COLORS.bg2 }}
        >
          <div className="flex items-center gap-2">
            {/* Logo image */}
            <img
              src="/assets/Logo.png"
              alt="Sexy Soul Logo"
              className="h-8 w-8 object-contain"
            />

            {/* Brand name */}
            <span
              className="text-base font-semibold tracking-wide"
              style={{ color: COLORS.text }}
            >
              Sexy Soul Admin
            </span>
          </div>

          <button
            className="lg:hidden"
            onClick={() => setIsOpen(false)}
            aria-label="Close sidebar"
          >
            <IoClose size={22} style={{ color: COLORS.text2 }} />
          </button>
        </div>

        {/* Divider */}
        <div className="px-6">
          <div style={{ height: 1, backgroundColor: COLORS.card }} />
        </div>

        {/* Menu */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const active = isMatch(item.path);
              return (
                <li key={item.label} className="relative pl-2">
                  {/* Active gradient rail */}
                  {active && (
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-7 w-1.5 rounded-full"
                      style={{
                        background: `linear-gradient(180deg, ${COLORS.gold}, ${COLORS.purple})`,
                      }}
                    />
                  )}

                  <Link
                    to={item.path}
                    aria-current={active ? "page" : undefined}
                    className="group flex items-center gap-3 px-3 py-2 rounded-xl transition"
                    style={{
                      backgroundColor: active ? COLORS.card : "transparent",
                      color: active ? COLORS.text : COLORS.text2,
                      boxShadow: active
                        ? `0 0 0 1px ${COLORS.ring} inset`
                        : "none",
                    }}
                  >
                    <item.icon
                      className="w-5 h-5"
                      style={{ color: active ? COLORS.gold : COLORS.text2 }}
                    />
                    <span
                      className="text-sm font-medium"
                      style={{ color: active ? COLORS.text : COLORS.text2 }}
                    >
                      {item.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="mt-auto">
          <div className="px-6">
            <div style={{ height: 1, backgroundColor: COLORS.card }} />
          </div>

          <div className="px-3 py-4">
            <Link
              to="/auth/login"
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition"
              style={{ color: COLORS.text2 }}
            >
              <MdLogout className="w-5 h-5" style={{ color: COLORS.text2 }} />
              Logout
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
};

export default LeftSidebar;
