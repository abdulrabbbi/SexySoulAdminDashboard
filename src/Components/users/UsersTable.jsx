import React, { useMemo, useState } from "react";
import {
  FiPlus,
  FiFilter,
  FiSliders,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiMail,
  FiDownload,
  FiUserCheck,
} from "react-icons/fi";

/* Theme */
const COLORS = {
  card: "#161821",
  text: "#E6E8F0",
  text2: "#A3A7B7",
  ring: "rgba(110,86,207,0.25)",
  gold: "#D4AF37",
  purple: "#6E56CF",
};

/* Simple bits */
const Checkbox = ({ checked, onChange }) => (
  <input
    type="checkbox"
    className="h-4 w-4 rounded border-transparent"
    checked={!!checked}
    onChange={(e) => onChange?.(e.target.checked)}
  />
);

const StatusPill = ({ status }) => {
  const map = {
    Active: "#22C55E",
    Trial: "#3B82F6",
    Cancelled: "#EF4444",
  };
  const c = map[status] || "#A3A7B7";
  return (
    <span
      className="px-2 py-0.5 rounded-md text-[11px] font-semibold"
      style={{ backgroundColor: `${c}22`, color: c }}
    >
      {status}
    </span>
  );
};

const TierBadge = ({ tier }) => {
  const map = {
    Free: "#A3A7B7",
    Paid: "#D4AF37",
    VIP: "#6E56CF",
    Trial: "#3B82F6",
  };
  const c = map[tier] || "#A3A7B7";
  return (
    <span
      className="px-2 py-0.5 rounded-md text-[11px] font-semibold"
      style={{ backgroundColor: `${c}22`, color: c }}
    >
      {tier}
    </span>
  );
};

const UserCell = ({ avatar, name, email }) => (
  <div className="flex items-center gap-3">
    <img src={avatar} alt={name} className="h-9 w-9 rounded-full object-cover" />
    <div>
      <div className="text-sm font-medium" style={{ color: COLORS.text }}>
        {name}
      </div>
      <div className="text-xs" style={{ color: COLORS.text2 }}>
        {email}
      </div>
    </div>
  </div>
);

/* CSV export */
const exportCSV = (rows) => {
  const headers = [
    "User ID",
    "Name",
    "Email",
    "Role",
    "Tier",
    "Sub Status",
    "Plan",
    "Next Invoice",
    "Amount",
    "Last Active",
    "Joined",
    "BrokerID",
  ];
  const body = rows.map((r) => [
    r.userId,
    r.name,
    r.email,
    r.role,
    r.tier,
    r.subscription.status,
    r.subscription.plan,
    r.subscription.nextInvoiceAt || "",
    r.subscription.amount || 0,
    r.lastActive,
    r.joinedAt,
    r.brokerId || "",
  ]);
  const csv = [headers, ...body]
    .map((line) => line.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `users_export_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

const UsersTable = ({ data = [], onOpenUser }) => {
  const [search, setSearch] = useState("");
  const [checked, setChecked] = useState(() => new Set());
  const [segment, setSegment] = useState("All"); // All, Free, Paid, VIP, Trial, Cancelled
  const [roleFilter, setRoleFilter] = useState("All"); // All, User, Broker, Admin
  const [statusFilter, setStatusFilter] = useState("All"); // All, Active, Trial, Cancelled
  const [page, setPage] = useState(1);
  const perPage = 8;

  const filtered = useMemo(() => {
    let rows = data;

    if (segment !== "All") {
      if (segment === "Cancelled") rows = rows.filter((r) => r.subscription.status === "Cancelled");
      else rows = rows.filter((r) => r.tier === segment);
    }
    if (roleFilter !== "All") rows = rows.filter((r) => r.role === roleFilter);
    if (statusFilter !== "All") rows = rows.filter((r) => r.subscription.status === statusFilter);

    if (search.trim()) {
      const s = search.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.name.toLowerCase().includes(s) ||
          r.email.toLowerCase().includes(s) ||
          r.userId.toLowerCase().includes(s) ||
          (r.brokerId || "").toLowerCase().includes(s)
      );
    }
    return rows;
  }, [data, search, segment, roleFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageRows = filtered.slice((page - 1) * perPage, page * perPage);
  const allSelected = checked.size > 0 && pageRows.every((_, i) => checked.has((page - 1) * perPage + i));

  const toggleAll = () => {
    if (allSelected) {
      const next = new Set(checked);
      pageRows.forEach((_, i) => next.delete((page - 1) * perPage + i));
      setChecked(next);
    } else {
      const next = new Set(checked);
      pageRows.forEach((_, i) => next.add((page - 1) * perPage + i));
      setChecked(next);
    }
  };

  const selectedRows = Array.from(checked).map((idx) => data[idx]).filter(Boolean);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.ring}` }}
    >
      {/* Toolbar */}
      <div className="px-3 sm:px-4 py-3 flex flex-col gap-3 md:flex-row md:items-center">
        {/* Segments */}
        <div className="flex flex-wrap items-center gap-2">
          {["All", "Free", "Paid", "VIP", "Trial", "Cancelled"].map((seg) => {
            const active = segment === seg;
            return (
              <button
                key={seg}
                onClick={() => setSegment(seg)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium"
                style={{
                  background: active ? `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.purple})` : "transparent",
                  color: active ? "#0B0B0F" : COLORS.text2,
                  border: active ? "none" : `1px solid ${COLORS.ring}`,
                }}
              >
                {seg}
              </button>
            );
          })}
        </div>

        <div className="flex-1" />

        {/* Search */}
        <div className="relative">
          <FiSearch
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: COLORS.text2 }}
          />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search users, email, ID, broker..."
            className="h-9 w-64 xl:w-80 rounded-lg pl-9 pr-3 text-sm outline-none"
            style={{
              backgroundColor: "#12131A",
              color: COLORS.text,
              border: `1px solid ${COLORS.ring}`,
            }}
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="h-9 rounded-lg px-2 text-sm"
            style={{ backgroundColor: "#12131A", color: COLORS.text, border: `1px solid ${COLORS.ring}` }}
          >
            {["All", "User", "Broker", "Admin"].map((r) => (
              <option key={r} value={r}>
                Role: {r}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="h-9 rounded-lg px-2 text-sm"
            style={{ backgroundColor: "#12131A", color: COLORS.text, border: `1px solid ${COLORS.ring}` }}
          >
            {["All", "Active", "Trial", "Cancelled"].map((s) => (
              <option key={s} value={s}>
                Status: {s}
              </option>
            ))}
          </select>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <button
            className="h-9 px-3 rounded-lg text-sm font-medium inline-flex items-center gap-2"
            style={{ backgroundColor: "#12131A", color: COLORS.text, border: `1px solid ${COLORS.ring}` }}
            onClick={() => alert("Create user (placeholder)")}
            title="Add User"
          >
            <FiPlus /> Add
          </button>
          <button
            className="h-9 px-3 rounded-lg text-sm font-medium inline-flex items-center gap-2"
            style={{ backgroundColor: "#12131A", color: COLORS.text, border: `1px solid ${COLORS.ring}` }}
            onClick={() => {
              if (!selectedRows.length) return alert("Select at least one user.");
              alert(`Message to ${selectedRows.length} users (placeholder).`);
            }}
            title="Message selected"
          >
            <FiMail /> Message
          </button>
          <button
            className="h-9 px-3 rounded-lg text-sm font-medium inline-flex items-center gap-2"
            style={{
              background: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.purple})`,
              color: "#0B0B0F",
            }}
            onClick={() => exportCSV(selectedRows.length ? selectedRows : filtered)}
            title="Export CSV"
          >
            <FiDownload /> Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-[1000px] w-full text-sm">
          <thead>
            <tr style={{ color: COLORS.text2, borderBottom: `1px solid ${COLORS.ring}` }}>
              <th className="px-4 py-3 w-10">
                <Checkbox checked={allSelected} onChange={toggleAll} />
              </th>
              <th className="py-3 text-left">User ID</th>
              <th className="py-3 text-left">User</th>
              <th className="py-3 text-left">Role</th>
              <th className="py-3 text-left">Tier</th>
              <th className="py-3 text-left">Subscription</th>
              <th className="py-3 text-left">Next Invoice</th>
              <th className="py-3 text-left">Last Active</th>
              <th className="py-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {pageRows.map((row, idxOnPage) => {
              const absoluteIdx = (page - 1) * perPage + idxOnPage;
              const active = checked.has(absoluteIdx);
              const zebra = absoluteIdx % 2 === 1;
              return (
                <tr
                  key={row.id}
                  className={zebra ? "bg-[#141622]" : ""}
                  style={{ color: COLORS.text, borderBottom: `1px solid ${COLORS.ring}` }}
                >
                  <td className="px-4 py-3">
                    <Checkbox
                      checked={active}
                      onChange={(v) => {
                        const next = new Set(checked);
                        v ? next.add(absoluteIdx) : next.delete(absoluteIdx);
                        setChecked(next);
                      }}
                    />
                  </td>

                  <td className="py-3" style={{ color: COLORS.text2 }}>
                    {row.userId}
                  </td>

                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <img src={row.avatar} alt={row.name} className="h-9 w-9 rounded-full object-cover" />
                      <div>
                        <div className="font-medium">{row.name}</div>
                        <div className="text-xs" style={{ color: COLORS.text2 }}>
                          {row.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3" style={{ color: COLORS.text2 }}>
                    {row.role}
                  </td>

                  <td className="py-3">
                    <TierBadge tier={row.tier} />
                  </td>

                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <StatusPill status={row.subscription.status} />
                      <span className="text-xs" style={{ color: COLORS.text2 }}>
                        {row.subscription.plan}
                      </span>
                    </div>
                  </td>

                  <td className="py-3" style={{ color: COLORS.text2 }}>
                    {row.subscription.nextInvoiceAt
                      ? `${row.subscription.nextInvoiceAt} ($${row.subscription.amount?.toFixed?.(2)})`
                      : "-"}
                  </td>

                  <td className="py-3" style={{ color: COLORS.text2 }}>
                    {row.lastActive}
                  </td>

                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <button
                        className="px-2 py-1 rounded-md text-xs font-semibold"
                        style={{ backgroundColor: "#12131A", border: `1px solid ${COLORS.ring}` }}
                        onClick={() => onOpenUser?.(row)}
                      >
                        View
                      </button>
                      <button
                        className="px-2 py-1 rounded-md text-xs font-semibold inline-flex items-center gap-1"
                        style={{
                          background: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.purple})`,
                          color: "#0B0B0F",
                        }}
                        onClick={() => alert(`Impersonating ${row.name} (placeholder)`)}
                      >
                        <FiUserCheck /> Impersonate
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {pageRows.length === 0 && (
              <tr>
                <td colSpan={9} className="py-8 text-center" style={{ color: COLORS.text2 }}>
                  No users found for the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between gap-2 p-3" style={{ color: COLORS.text2 }}>
        <div className="text-xs">
          Showing {(page - 1) * perPage + 1}-{Math.min(page * perPage, filtered.length)} of {filtered.length}
        </div>
        <div className="flex items-center gap-1">
          <button
            className="h-8 w-8 grid place-items-center rounded-md"
            style={{ backgroundColor: "#12131A", border: `1px solid ${COLORS.ring}` }}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <FiChevronLeft />
          </button>
          {Array.from({ length: totalPages }).slice(0, 5).map((_, i) => {
            const n = i + 1;
            const active = n === page;
            return (
              <button
                key={n}
                className="h-8 w-8 rounded-md text-sm"
                style={{
                  background: active ? `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.purple})` : "#12131A",
                  color: active ? "#0B0B0F" : COLORS.text,
                  border: `1px solid ${COLORS.ring}`,
                }}
                onClick={() => setPage(n)}
              >
                {n}
              </button>
            );
          })}
          <button
            className="h-8 w-8 grid place-items-center rounded-md"
            style={{ backgroundColor: "#12131A", border: `1px solid ${COLORS.ring}` }}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            <FiChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UsersTable;
