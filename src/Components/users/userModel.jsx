import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { IoClose } from "react-icons/io5";

const COLORS = {
  bg2: "#12131A",
  card: "#161821",
  text: "#E6E8F0",
  text2: "#A3A7B7",
  ring: "rgba(110,86,207,0.25)",
  gold: "#D4AF37",
  purple: "#6E56CF",
};

const initialForm = {
  username: "",
  fullname: "",
  password: "",
  email: "",
  role: "User",
  status: "Active",
};

const CreateUserModal = ({ open, onClose, onSave }) => {
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    setForm(initialForm);
    setErrors({});
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validate = () => {
  const next = {};

  if (!form.fullname.trim()) next.fullname = "Full name is required";
  if (!form.username.trim()) next.username = "Username is required";
  if (!form.email.trim()) next.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    next.email = "Enter a valid email";
  }

  if (!form.password.trim()) next.password = "Password is required";
  else if (form.password.length < 6) {
    next.password = "Password must be at least 6 characters";
  }

  if (!form.role) next.role = "Role is required";
  if (!form.status) next.status = "Status is required";

  setErrors(next);
  return Object.keys(next).length === 0;
};

  const handleSubmit = (e) => {
  e.preventDefault();
  console.log("modal submit form:", form);
  if (!validate()) {
    console.log("validation failed");
    return;
  }

  onSave?.({
    username: form.username.trim(),
    fullname: form.fullname.trim(),
    password: form.password,
    email: form.email.trim(),
    role: form.role,
    status: form.status,
  });
};

  if (!open || !mounted) return null;

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[1999]"
        onClick={onClose}
        style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
      />

      <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
        <div
          className="w-full max-w-lg rounded-2xl overflow-hidden"
          style={{
            backgroundColor: COLORS.bg2,
            border: `1px solid ${COLORS.ring}`,
          }}
        >
          <div
            className="p-4 flex items-center justify-between"
            style={{ borderBottom: `1px solid ${COLORS.ring}` }}
          >
            <div>
              <div className="text-lg font-semibold text-center " style={{ color: COLORS.text }}>
                <p className="flex justify-center items-center">Create User</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg"
              style={{ color: COLORS.text2, backgroundColor: "transparent" }}
              aria-label="Close"
            >
              <IoClose size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div>
              <label className="text-xs mb-1 block" style={{ color: COLORS.text2 }}>
                Full Name
              </label>
              <input
                value={form.fullname}
                onChange={(e) => setField("fullname", e.target.value)}
                placeholder="Enter full name"
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={{
                  backgroundColor: "#12131A",
                  color: COLORS.text,
                  border: `1px solid ${errors.fullname ? "#EF4444" : COLORS.ring}`,
                }}
              />
              {errors.fullname && (
                <div className="mt-1 text-xs text-red-400">{errors.fullname}</div>
              )}
            </div>
              <div>
              <label className="text-xs mb-1 block" style={{ color: COLORS.text2 }}>
                Username
              </label>
              <input
                value={form.username}
                onChange={(e) => setField("username", e.target.value)}
                placeholder="Enter username"
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={{
                  backgroundColor: "#12131A",
                  color: COLORS.text,
                  border: `1px solid ${errors.username ? "#EF4444" : COLORS.ring}`,
                }}
              />
              {errors.username && (
                <div className="mt-1 text-xs text-red-400">{errors.username}</div>
              )}
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: COLORS.text2 }}>
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                placeholder="Enter email address"
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={{
                  backgroundColor: "#12131A",
                  color: COLORS.text,
                  border: `1px solid ${errors.email ? "#EF4444" : COLORS.ring}`,
                }}
              />
              {errors.email && (
                <div className="mt-1 text-xs text-red-400">{errors.email}</div>
              )}
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: COLORS.text2 }}>
                    password
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setField("password", e.target.value)}
                placeholder="Enter password"
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={{
                  backgroundColor: "#12131A",
                  color: COLORS.text,
                  border: `1px solid ${errors.password ? "#EF4444" : COLORS.ring}`,
                }}
              />
              {errors.password && (
                <div className="mt-1 text-xs text-red-400">{errors.password}</div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs mb-1 block" style={{ color: COLORS.text2 }}>
                  Role
                </label>
                <select
                  value={form.role}
                  onChange={(e) => setField("role", e.target.value)}
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                  style={{
                    backgroundColor: "#12131A",
                    color: COLORS.text,
                    border: `1px solid ${errors.role ? "#EF4444" : COLORS.ring}`,
                  }}
                >
                  <option value="User">User</option>
                  <option value="Broker">Broker</option>
                  <option value="Admin">Admin</option>
                </select>
                {errors.role && (
                  <div className="mt-1 text-xs text-red-400">{errors.role}</div>
                )}
              </div>

              <div>
                <label className="text-xs mb-1 block" style={{ color: COLORS.text2 }}>
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setField("status", e.target.value)}
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                  style={{
                    backgroundColor: "#12131A",
                    color: COLORS.text,
                    border: `1px solid ${errors.status ? "#EF4444" : COLORS.ring}`,
                  }}
                >
                  <option value="Active">Active</option>
                  <option value="Trial">Trial</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                {errors.status && (
                  <div className="mt-1 text-xs text-red-400">{errors.status}</div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm font-medium"
                style={{
                  backgroundColor: "#12131A",
                  border: `1px solid ${COLORS.ring}`,
                  color: COLORS.text,
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-sm font-semibold"
                style={{
                  background: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.purple})`,
                  color: "#0B0B0F",
                }}
              >
                Create User
              </button>
            </div>
          </form>
        </div>
      </div>
    </>,
    document.body
  );
};

export default CreateUserModal;