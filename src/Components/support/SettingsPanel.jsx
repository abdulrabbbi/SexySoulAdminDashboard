import React, { useMemo, useState } from "react";
import { MdPalette, MdGroups, MdPayment, MdLink, MdSecurity, MdListAlt, MdSave, MdDownload } from "react-icons/md";
import { COLORS } from "../../Pages/SupportMediaSettingsPage";

const SECTIONS = [
  { key: "brand", label: "Brand Kit", Icon: MdPalette },
  { key: "founders", label: "Founders Profiles", Icon: MdGroups },
  { key: "plans", label: "Plans & Features", Icon: MdPayment },
  { key: "integrations", label: "Integrations", Icon: MdLink },
  { key: "roles", label: "Roles & Permissions", Icon: MdSecurity },
  { key: "audit", label: "Audit Logs", Icon: MdListAlt },
];

const SettingsPanel = ({
  brand, onSaveBrand,
  founders, onSaveFounders,
  plans, onSavePlans,
  integrations, onSaveIntegrations,
  roles, onSaveRoles,
  audit, onExportAudit,
}) => {
  const [section, setSection] = useState("brand");

  const content = useMemo(() => {
    switch (section) {
      case "brand":     return <BrandKit value={brand} onSave={onSaveBrand} />;
      case "founders":  return <Founders value={founders} onSave={onSaveFounders} />;
      case "plans":     return <Plans value={plans} onSave={onSavePlans} />;
      case "integrations": return <Integrations value={integrations} onSave={onSaveIntegrations} />;
      case "roles":     return <Roles value={roles} onSave={onSaveRoles} />;
      case "audit":     return <Audit value={audit} onExport={onExportAudit} />;
      default:          return null;
    }
  }, [section, brand, founders, plans, integrations, roles, audit, onSaveBrand, onSaveFounders, onSavePlans, onSaveIntegrations, onSaveRoles, onExportAudit]);

  return (
    <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
      {/* left nav */}
      <div className="rounded-2xl p-3" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.ring}` }}>
        <div className="text-xs mb-2" style={{ color: COLORS.text2 }}>Settings</div>
        <div className="space-y-1">
          {SECTIONS.map(({ key, label }) => {
            const active = section === key;
            return (
              <button
                key={key}
                onClick={() => setSection(key)}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold inline-flex items-center gap-2"
                style={{
                  background: active ? `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.purple})` : "transparent",
                  color: active ? "#0B0B0F" : COLORS.text2,
                  border: active ? "none" : `1px solid ${COLORS.ring}`,
                }}
              >
                <Icon size={16} /> {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* right content */}
      <div>{content}</div>
    </div>
  );
};

export default SettingsPanel;

/* ---------- Brand Kit ---------- */
const BrandKit = ({ value, onSave }) => {
  const [b, setB] = useState(value);
  const set = (patch) => setB((p) => ({ ...p, ...patch }));
  const setColor = (k, v) => set({ colors: { ...(b.colors || {}), [k]: v } });
  const setFont = (k, v) => set({ typography: { ...(b.typography || {}), [k]: v } });

  return (
    <div className="rounded-2xl p-4 space-y-4" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.ring}`, color: COLORS.text }}>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs" style={{ color: COLORS.text2 }}>Logo URL</label>
          <input
            value={b.logo || ""}
            onChange={(e) => set({ logo: e.target.value })}
            className="mt-1 w-full rounded-lg px-3 h-10 text-sm outline-none"
            style={{ backgroundColor: "#12131A", color: COLORS.text, border: `1px solid ${COLORS.ring}` }}
            placeholder="/assets/Logo.png"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {["primary", "accent", "bg", "text"].map((k) => (
          <div key={k}>
            <label className="text-xs" style={{ color: COLORS.text2 }}>{`Color: ${k}`}</label>
            <input
              value={b.colors?.[k] || ""}
              onChange={(e) => setColor(k, e.target.value)}
              className="mt-1 w-full rounded-lg px-3 h-10 text-sm outline-none"
              style={{ backgroundColor: "#12131A", color: COLORS.text, border: `1px solid ${COLORS.ring}` }}
              placeholder="#000000"
            />
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs" style={{ color: COLORS.text2 }}>UI Font</label>
          <input
            value={b.typography?.ui || ""}
            onChange={(e) => setFont("ui", e.target.value)}
            className="mt-1 w-full rounded-lg px-3 h-10 text-sm outline-none"
            style={{ backgroundColor: "#12131A", color: COLORS.text, border: `1px solid ${COLORS.ring}` }}
            placeholder="Inter / Manrope"
          />
        </div>
        <div>
          <label className="text-xs" style={{ color: COLORS.text2 }}>Brand Font</label>
          <input
            value={b.typography?.brand || ""}
            onChange={(e) => setFont("brand", e.target.value)}
            className="mt-1 w-full rounded-lg px-3 h-10 text-sm outline-none"
            style={{ backgroundColor: "#12131A", color: COLORS.text, border: `1px solid ${COLORS.ring}` }}
            placeholder="Playfair Display / Fraunces"
          />
        </div>
      </div>

      <div className="flex items-center justify-end">
        <button
          className="px-3 py-2 rounded-xl text-sm font-medium inline-flex items-center gap-2"
          style={{ background: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.purple})`, color: "#0B0B0F" }}
          onClick={() => onSave?.(b)}
        >
          <MdSave /> Save
        </button>
      </div>
    </div>
  );
};

/* ---------- Founders ---------- */
const Founders = ({ value = [], onSave }) => {
  const [list, setList] = useState(value);
  const update = (i, patch) => setList((prev) => prev.map((f, idx) => (idx === i ? { ...f, ...patch } : f)));

  return (
    <div className="rounded-2xl p-4 space-y-3" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.ring}`, color: COLORS.text }}>
      {list.map((f, i) => (
        <div key={f.id} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 rounded-xl p-3"
             style={{ backgroundColor: "#0F1118", border: `1px solid ${COLORS.ring}` }}>
          <input
            value={f.name}
            onChange={(e) => update(i, { name: e.target.value })}
            className="rounded-lg px-3 h-10 text-sm outline-none"
            style={{ backgroundColor: "#12131A", color: COLORS.text, border: `1px solid ${COLORS.ring}` }}
          />
          <input
            value={f.title}
            onChange={(e) => update(i, { title: e.target.value })}
            className="rounded-lg px-3 h-10 text-sm outline-none"
            style={{ backgroundColor: "#12131A", color: COLORS.text, border: `1px solid ${COLORS.ring}` }}
          />
          <input
            value={f.handles?.ig || ""}
            onChange={(e) => update(i, { handles: { ...(f.handles || {}), ig: e.target.value } })}
            className="rounded-lg px-3 h-10 text-sm outline-none"
            style={{ backgroundColor: "#12131A", color: COLORS.text, border: `1px solid ${COLORS.ring}` }}
            placeholder="Instagram"
          />
          <input
            value={f.handles?.x || ""}
            onChange={(e) => update(i, { handles: { ...(f.handles || {}), x: e.target.value } })}
            className="rounded-lg px-3 h-10 text-sm outline-none"
            style={{ backgroundColor: "#12131A", color: COLORS.text, border: `1px solid ${COLORS.ring}` }}
            placeholder="X / Twitter"
          />
        </div>
      ))}
      <div className="flex items-center justify-between">
        <button
          className="px-3 py-2 rounded-xl text-sm font-medium"
          style={{ backgroundColor: "#12131A", border: `1px solid ${COLORS.ring}`, color: COLORS.text }}
          onClick={() => setList((prev) => [...prev, { id: `f_${Date.now()}`, name: "", title: "", handles: {} }])}
        >
          Add Founder
        </button>
        <button
          className="px-3 py-2 rounded-xl text-sm font-medium inline-flex items-center gap-2"
          style={{ background: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.purple})`, color: "#0B0B0F" }}
          onClick={() => onSave?.(list)}
        >
          <MdSave /> Save
        </button>
      </div>
    </div>
  );
};

/* ---------- Plans & Features ---------- */
const Plans = ({ value, onSave }) => {
  const [v, setV] = useState(value);
  const addFeature = (i) =>
    setV((p) => ({
      ...p,
      tiers: p.tiers.map((t, idx) => (idx === i ? { ...t, features: [...t.features, ""] } : t)),
    }));
  const setFeature = (i, j, val) =>
    setV((p) => ({
      ...p,
      tiers: p.tiers.map((t, idx) =>
        idx === i ? { ...t, features: t.features.map((f, k) => (k === j ? val : f)) } : t
      ),
    }));

  const setTierVal = (i, patch) =>
    setV((p) => ({
      ...p,
      tiers: p.tiers.map((t, idx) => (idx === i ? { ...t, ...patch } : t)),
    }));

  return (
    <div className="space-y-3">
      {v.tiers.map((t, i) => (
        <div key={t.name} className="rounded-2xl p-4 space-y-3" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.ring}`, color: COLORS.text }}>
          <div className="grid sm:grid-cols-3 gap-3">
            <input
              value={t.name}
              onChange={(e) => setTierVal(i, { name: e.target.value })}
              className="rounded-lg px-3 h-10 text-sm outline-none"
              style={{ backgroundColor: "#12131A", color: COLORS.text, border: `1px solid ${COLORS.ring}` }}
            />
            <input
              type="number"
              value={t.price}
              onChange={(e) => setTierVal(i, { price: Number(e.target.value || 0) })}
              className="rounded-lg px-3 h-10 text-sm outline-none"
              style={{ backgroundColor: "#12131A", color: COLORS.text, border: `1px solid ${COLORS.ring}` }}
            />
            <div className="flex items-center">
              <span className="text-xs" style={{ color: COLORS.text2 }}>$/month</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-xs" style={{ color: COLORS.text2 }}>Features</div>
            {t.features.map((f, j) => (
              <input
                key={j}
                value={f}
                onChange={(e) => setFeature(i, j, e.target.value)}
                className="w-full rounded-lg px-3 h-10 text-sm outline-none"
                style={{ backgroundColor: "#12131A", color: COLORS.text, border: `1px solid ${COLORS.ring}` }}
              />
            ))}
            <button
              className="px-3 py-2 rounded-xl text-sm font-medium"
              style={{ backgroundColor: "#12131A", border: `1px solid ${COLORS.ring}`, color: COLORS.text }}
              onClick={() => addFeature(i)}
            >
              Add Feature
            </button>
          </div>
        </div>
      ))}

      <div className="flex items-center justify-end">
        <button
          className="px-3 py-2 rounded-xl text-sm font-medium inline-flex items-center gap-2"
          style={{ background: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.purple})`, color: "#0B0B0F" }}
          onClick={() => onSave?.(v)}
        >
          <MdSave /> Save
        </button>
      </div>
    </div>
  );
};

/* ---------- Integrations ---------- */
const Integrations = ({ value = [], onSave }) => {
  const [list, setList] = useState(value);
  const toggle = (key) =>
    setList((prev) => prev.map((i) => (i.key === key ? { ...i, status: i.status === "Connected" ? "Disconnected" : "Connected", last: ts() } : i)));

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {list.map((i) => (
        <div key={i.key} className="rounded-2xl p-4" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.ring}`, color: COLORS.text }}>
          <div className="text-sm font-semibold">{i.name}</div>
          <div className="text-xs mt-1" style={{ color: COLORS.text2 }}>
            {i.status} • Last: {i.last}
          </div>
          <div className="flex items-center justify-end mt-3">
            <button
              className="px-3 py-2 rounded-xl text-sm font-medium"
              style={{
                background: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.purple})`,
                color: "#0B0B0F",
              }}
              onClick={() => toggle(i.key)}
            >
              {i.status === "Connected" ? "Disconnect" : "Connect"}
            </button>
          </div>
        </div>
      ))}
      <div className="sm:col-span-2 flex items-center justify-end">
        <button
          className="px-3 py-2 rounded-xl text-sm font-medium inline-flex items-center gap-2"
          style={{ background: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.purple})`, color: "#0B0B0F" }}
          onClick={() => onSave?.(list)}
        >
          <MdSave /> Save
        </button>
      </div>
    </div>
  );
};

/* ---------- Roles & Permissions ---------- */
const PERMS = [
  { key: "content.view", label: "Content: View" },
  { key: "content.edit", label: "Content: Edit" },
  { key: "events.view", label: "Events: View" },
  { key: "events.edit", label: "Events: Edit" },
  { key: "live.moderate", label: "Live: Moderate" },
  { key: "tickets.view", label: "Tickets: View" },
  { key: "tickets.reply", label: "Tickets: Reply" },
  { key: "billing.view", label: "Billing: View" },
  { key: "refunds.process", label: "Refunds: Process" },
];

const Roles = ({ value = [], onSave }) => {
  const [list, setList] = useState(value);

  const has = (role, p) => role.perms.includes("all") || role.perms.includes(p);
  const toggle = (ri, perm) =>
    setList((prev) =>
      prev.map((r, i) => {
        if (i !== ri) return r;
        if (r.perms.includes("all")) return r; // super admin immutable here
        const on = r.perms.includes(perm);
        return { ...r, perms: on ? r.perms.filter((x) => x !== perm) : [...r.perms, perm] };
      })
    );

  return (
    <div className="rounded-2xl p-4 space-y-4" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.ring}`, color: COLORS.text }}>
      <div className="overflow-x-auto">
        <table className="min-w-[900px] w-full text-sm">
          <thead>
            <tr style={{ color: COLORS.text2, borderBottom: `1px solid ${COLORS.ring}` }}>
              <th className="py-3 px-3 text-left">Role</th>
              {PERMS.map((p) => (
                <th key={p.key} className="py-3 text-left">{p.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {list.map((r, ri) => (
              <tr key={r.role} style={{ borderBottom: `1px solid ${COLORS.ring}` }}>
                <td className="py-3 px-3 font-semibold">{r.role}</td>
                {PERMS.map((p) => (
                  <td key={p.key} className="py-3">
                    <input
                      type="checkbox"
                      className="accent-[#6E56CF]"
                      checked={has(r, p.key)}
                      onChange={() => toggle(ri, p.key)}
                      disabled={r.perms.includes("all")}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-end">
        <button
          className="px-3 py-2 rounded-xl text-sm font-medium inline-flex items-center gap-2"
          style={{ background: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.purple})`, color: "#0B0B0F" }}
          onClick={() => onSave?.(list)}
        >
          <MdSave /> Save
        </button>
      </div>
    </div>
  );
};

/* ---------- Audit Logs ---------- */
const Audit = ({ value = [], onExport }) => {
  return (
    <div className="rounded-2xl" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.ring}`, color: COLORS.text }}>
      <div className="px-3 sm:px-4 py-3 flex items-center justify-between rounded-t-2xl"
           style={{ backgroundColor: COLORS.bg2, borderBottom: `1px solid ${COLORS.ring}` }}>
        <div className="text-sm font-semibold">Audit Logs</div>
        <button
          className="h-9 px-3 rounded-lg text-sm font-medium inline-flex items-center gap-2"
          style={{ background: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.purple})`, color: "#0B0B0F" }}
          onClick={onExport}
        >
          <MdDownload /> Export
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[680px] w-full text-sm">
          <thead>
            <tr style={{ color: COLORS.text2, borderBottom: `1px solid ${COLORS.ring}` }}>
              <th className="py-3 px-3 text-left">Actor</th>
              <th className="py-3 text-left">Action</th>
              <th className="py-3 text-left">Target</th>
              <th className="py-3 text-left">At</th>
            </tr>
          </thead>
          <tbody>
            {value.map((r) => (
              <tr key={r.id} style={{ borderBottom: `1px solid ${COLORS.ring}` }}>
                <td className="py-3 px-3">{r.actor}</td>
                <td className="py-3">{r.action}</td>
                <td className="py-3">{r.target}</td>
                <td className="py-3">{r.at}</td>
              </tr>
            ))}
            {!value.length && (
              <tr>
                <td colSpan={4} className="py-8 text-center" style={{ color: COLORS.text2 }}>
                  No audit logs yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ts = () => new Date().toISOString().replace("T", " ").slice(0, 16);
