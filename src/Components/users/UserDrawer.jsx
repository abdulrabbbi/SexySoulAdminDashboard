import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { IoClose } from "react-icons/io5";
import { FiCopy, FiEdit2, FiRefreshCw } from "react-icons/fi";

/* Theme */
const COLORS = {
  bg: "#0B0B0F",
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

const Field = ({ label, children }) => (
  <div>
    <div className="text-[11px] uppercase tracking-wide mb-1" style={{ color: COLORS.text2 }}>
      {label}
    </div>
    <div className="text-sm" style={{ color: COLORS.text }}>
      {children}
    </div>
  </div>
);

const Badge = ({ children, color = COLORS.ok }) => (
  <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold" style={{ backgroundColor: `${color}22`, color }}>
    {children}
  </span>
);

const TabBtn = ({ active, children, onClick }) => (
  <button
    onClick={onClick}
    className="px-3 py-2 rounded-lg text-sm font-medium"
    style={{
      background: active ? `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.purple})` : "transparent",
      color: active ? "#0B0B0F" : COLORS.text2,
      border: active ? "none" : `1px solid ${COLORS.ring}`,
    }}
  >
    {children}
  </button>
);

const UserDrawer = ({ user, onClose }) => {
  const [tab, setTab] = useState("profile");
  const isOpen = !!user;
  const [mounted, setMounted] = useState(false);

  // mount flag for portal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // lock body scroll while open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);


  if (!isOpen || !mounted) return null;

  const content = (
    <>
      {/* Backdrop above everything except the drawer */}
      <div
        className="fixed inset-0 z-[1999]"
        onClick={onClose}
        style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
      />

      {/* Drawer panel — HIGHER than RightSidebar (which is z-[1001]) */}
      <aside
        className="fixed inset-y-0 right-0 w-[420px] max-w-[92vw] z-[2000] overflow-y-auto"
        style={{ backgroundColor: COLORS.bg2, borderLeft: `1px solid ${COLORS.ring}` }}
      >
        {/* Header */}
        <div className="p-4 sticky top-0 flex items-center justify-between"
             style={{ backgroundColor: COLORS.bg2, borderBottom: `1px solid ${COLORS.ring}` }}>
          <div className="flex items-center gap-3">
            <img src={user.avatar} alt={user.name} className="h-10 w-10 rounded-full object-cover" />
            <div>
              <div className="text-sm font-semibold" style={{ color: COLORS.text }}>
                {user.name}
              </div>
              <div className="text-xs" style={{ color: COLORS.text2 }}>
                {user.email}
              </div>
            </div>
          </div>
          <button
            className="p-2 rounded-lg"
            onClick={onClose}
            style={{ color: COLORS.text2, backgroundColor: "transparent" }}
            aria-label="Close"
          >
            <IoClose size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-4 flex flex-wrap gap-2">
          <TabBtn active={tab === "profile"} onClick={() => setTab("profile")}>Profile</TabBtn>
          <TabBtn active={tab === "membership"} onClick={() => setTab("membership")}>Membership</TabBtn>
          <TabBtn active={tab === "invoices"} onClick={() => setTab("invoices")}>Invoices</TabBtn>
          <TabBtn active={tab === "devices"} onClick={() => setTab("devices")}>Devices</TabBtn>
          <TabBtn active={tab === "notes"} onClick={() => setTab("notes")}>Notes</TabBtn>
          <TabBtn active={tab === "audit"} onClick={() => setTab("audit")}>Audit</TabBtn>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {tab === "profile" && (
            <div className="rounded-2xl p-4 space-y-4"
                 style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.ring}` }}>
              <div className="grid grid-cols-2 gap-4">
                <Field label="User ID">{user.userId}</Field>
                <Field label="Role">{user.role}</Field>
                <Field label="Broker ID">{user.brokerId || "-"}</Field>
                <Field label="Joined">{user.joinedAt}</Field>
                <Field label="Last Active">{user.lastActive}</Field>
              </div>

              <div className="flex items-center gap-3">
                <button
                  className="px-3 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2"
                  style={{ backgroundColor: "#12131A", border: `1px solid ${COLORS.ring}`, color: COLORS.text }}
                  onClick={() => alert("Edit profile (placeholder)")}
                >
                  <FiEdit2 /> Edit Profile
                </button>
                <button
                  className="px-3 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2"
                  style={{
                    background: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.purple})`,
                    color: "#0B0B0F",
                  }}
                  onClick={() => {
                    navigator.clipboard?.writeText?.(user.email);
                    alert("Email copied.");
                  }}
                >
                  <FiCopy /> Copy Email
                </button>
              </div>
            </div>
          )}

          {tab === "membership" && (
            <div className="rounded-2xl p-4 space-y-4"
                 style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.ring}` }}>
              <div className="flex items-center gap-3">
                <Badge color={user.tier === "VIP" ? COLORS.purple : user.tier === "Paid" ? COLORS.gold : COLORS.text2}>
                  {user.tier}
                </Badge>
                <Badge color={user.subscription.status === "Active" ? COLORS.ok : user.subscription.status === "Trial" ? COLORS.warn : COLORS.danger}>
                  {user.subscription.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Plan">{user.subscription.plan}</Field>
                <Field label="Next Invoice">
                  {user.subscription.nextInvoiceAt
                    ? `${user.subscription.nextInvoiceAt} ($${user.subscription.amount?.toFixed?.(2)})`
                    : "-"}
                </Field>
              </div>

              <div className="flex items-center gap-3">
                <button
                  className="px-3 py-2 rounded-lg text-sm font-medium"
                  style={{ backgroundColor: "#12131A", border: `1px solid ${COLORS.ring}`, color: COLORS.text }}
                  onClick={() => alert("Change plan (placeholder)")}
                >
                  Change Plan
                </button>
                <button
                  className="px-3 py-2 rounded-lg text-sm font-medium"
                  style={{ backgroundColor: "#12131A", border: `1px solid ${COLORS.ring}`, color: COLORS.text }}
                  onClick={() => alert("Issue refund (placeholder)")}
                >
                  Refund
                </button>
                <button
                  className="px-3 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2"
                  style={{
                    background: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.purple})`,
                    color: "#0B0B0F",
                  }}
                  onClick={() => alert("Refresh subscription (placeholder)")}
                >
                  <FiRefreshCw /> Refresh
                </button>
              </div>
            </div>
          )}

          {tab === "invoices" && (
            <div className="rounded-2xl p-4"
                 style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.ring}` }}>
              <table className="w-full text-sm">
                <thead style={{ color: COLORS.text2 }}>
                  <tr>
                    <th className="text-left py-2">Invoice ID</th>
                    <th className="text-left py-2">Date</th>
                    <th className="text-left py-2">Amount</th>
                    <th className="text-left py-2">Status</th>
                  </tr>
                </thead>
                <tbody style={{ color: COLORS.text }}>
                  {(user.invoices || []).length ? (
                    user.invoices.map((inv) => (
                      <tr key={inv.id} style={{ borderTop: `1px solid ${COLORS.ring}` }}>
                        <td className="py-2">{inv.id}</td>
                        <td className="py-2">{inv.date}</td>
                        <td className="py-2">${inv.amount?.toFixed?.(2)}</td>
                        <td className="py-2">
                          <Badge color={inv.status === "paid" ? COLORS.ok : inv.status === "refunded" ? COLORS.warn : COLORS.text2}>
                            {inv.status}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-4 text-center" style={{ color: COLORS.text2 }}>
                        No invoices
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {tab === "devices" && (
            <div className="rounded-2xl p-4 space-y-3"
                 style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.ring}` }}>
              {(user.devices || []).length ? (
                user.devices.map((d) => (
                  <div key={d.id} className="flex items-center justify-between">
                    <div>
                      <div className="text-sm" style={{ color: COLORS.text }}>
                        {d.device} • {d.os}
                      </div>
                      <div className="text-xs" style={{ color: COLORS.text2 }}>
                        Last seen: {d.lastSeen} • {d.location}
                      </div>
                    </div>
                    <button
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                      style={{ backgroundColor: "#12131A", border: `1px solid ${COLORS.ring}`, color: COLORS.text }}
                      onClick={() => alert("Revoke device (placeholder)")}
                    >
                      Revoke
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-sm" style={{ color: COLORS.text2 }}>
                  No devices
                </div>
              )}
            </div>
          )}

          {tab === "notes" && (
            <div className="rounded-2xl p-4 space-y-3"
                 style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.ring}` }}>
              <div className="text-sm" style={{ color: COLORS.text }}>
                {user.notes || "No notes yet."}
              </div>
              <textarea
                rows={4}
                defaultValue={user.notes || ""}
                className="w-full rounded-lg p-3 text-sm outline-none"
                style={{ backgroundColor: "#12131A", color: COLORS.text, border: `1px solid ${COLORS.ring}` }}
                placeholder="Add an internal note…"
                onBlur={(e) => alert(`Saving note (placeholder): ${e.target.value}`)}
              />
            </div>
          )}

          {tab === "audit" && (
            <div className="rounded-2xl p-4 space-y-3"
                 style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.ring}` }}>
              {(user.audit || []).length ? (
                user.audit.map((a) => (
                  <div key={a.id} className="flex items-center justify-between">
                    <div>
                      <div className="text-sm" style={{ color: COLORS.text }}>
                        {a.action}
                      </div>
                      <div className="text-xs" style={{ color: COLORS.text2 }}>
                        {a.when} • {a.by}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm" style={{ color: COLORS.text2 }}>
                  No audit events
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );

  return createPortal(content, document.body);
};

export default UserDrawer;
