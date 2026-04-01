import React, { useMemo, useState, useEffect } from "react";
import UsersTable from "../Components/users/UsersTable";
import UserDrawer from "../Components/users/UserDrawer";
import CreateUserModal from "../Components/users/userModel";
import { getUsers, createUser } from "../Components/users/user.store";

const COLORS = {
  bg: "#0B0B0F",
  bg2: "#12131A",
  card: "#161821",
  text: "#E6E8F0",
  text2: "#A3A7B7",
  ring: "rgba(110,86,207,0.25)",
  gold: "#D4AF37",
  purple: "#6E56CF",
};

const deriveKpis = (list) => {
  const total = list.length;
  const paid = list.filter((u) => u.tier === "Paid").length;
  const vip = list.filter((u) => u.tier === "VIP").length;
  const trial = list.filter((u) => u.tier === "Trial").length;
  const cancelled = list.filter(
    (u) => u.subscription.status === "Cancelled"
  ).length;

  return [
    { label: "Total Users", value: total.toLocaleString() },
    { label: "Paid", value: paid.toLocaleString() },
    { label: "VIP", value: vip.toLocaleString() },
    { label: "Trial", value: trial.toLocaleString() },
    { label: "Cancelled", value: cancelled.toLocaleString() },
  ];
};

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [drawerUser, setDrawerUser] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getUsers(1, 20);
      console.log("mapped users:", data);
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("fetch users error:", err);
      setError(err.message || "Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const kpis = useMemo(() => deriveKpis(users), [users]);

  const handleCreateUser = async (payload) => {
  try {
    console.log("creating user payload:", payload);
    const newUser = await createUser(payload);
    setUsers((prev) => [newUser, ...prev]);
    setCreateModalOpen(false);
  } catch (err) {
    console.error("create user error:", err);
    alert(err.message || "Failed to create user");
  }
};

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1
          className="text-xl md:text-2xl font-semibold"
          style={{ color: COLORS.text }}
        >
          Users & Memberships
        </h1>
      </div>

      {error && (
        <div
          className="rounded-xl px-4 py-3 text-sm"
          style={{
            backgroundColor: "rgba(239,68,68,0.12)",
            border: "1px solid rgba(239,68,68,0.3)",
            color: "#fca5a5",
          }}
        >
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="rounded-2xl p-4"
            style={{
              backgroundColor: COLORS.card,
              border: `1px solid ${COLORS.ring}`,
            }}
          >
            <div className="text-xs" style={{ color: COLORS.text2 }}>
              {k.label}
            </div>
            <div
              className="mt-1 text-2xl font-semibold"
              style={{ color: COLORS.text }}
            >
              {loading ? "..." : k.value}
            </div>
            <div
              className="mt-3 h-1 rounded-full"
              style={{
                background: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.purple})`,
              }}
            />
          </div>
        ))}
      </div>

      <UsersTable
        data={users}
        onOpenUser={(u) => setDrawerUser(u)}
        onCreateUser={() => setCreateModalOpen(true)}
      />

      <UserDrawer user={drawerUser} onClose={() => setDrawerUser(null)} />

      <CreateUserModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSave={handleCreateUser}
      />
    </div>
  );
};

export default UsersPage;