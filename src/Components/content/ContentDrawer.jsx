import  { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  MdClose,
  MdCloudUpload,
  MdTag,
  MdCategory,
  MdSecurity,
  MdSchedule,
} from "react-icons/md";

const COLORS = {
  bg2: "#12131A",
  card: "#161821",
  text: "#E6E8F0",
  text2: "#A3A7B7",
  ring: "rgba(110,86,207,0.25)",
  gold: "#D4AF37",
  purple: "#6E56CF",
};

const fieldsDefault = {
  id: "",
  title: "",
  category: "Real Estate",
  type: "video", // video/article/audio/download
  status: "Draft", // Draft/Scheduled/Published
  tier: ["Free"], // multi
  duration: 0,
  createdAt: new Date().toISOString().slice(0, 10),
  scheduledAt: "",
  tags: [],
  collection: "",
  views: 0,
  watchTime: 0,
  listens: 0,
  cover: "",
  mediaUrl: "",
  seo: { slug: "", metaTitle: "", metaDescription: "" },
  body: "", // for article
};

const TogglePill = ({ active, label, onClick }) => (
  <button
    onClick={onClick}
    className="px-3 py-1.5 rounded-lg text-sm font-medium"
    style={{
      background: active ? `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.purple})` : "transparent",
      color: active ? "#0B0B0F" : COLORS.text2,
      border: active ? "none" : `1px solid ${COLORS.ring}`,
    }}
  >
    {label}
  </button>
);

const ContentDrawer = ({ open, initial, collections = [], onClose, onSave }) => {
  const [mounted, setMounted] = useState(false);
  const [record, setRecord] = useState(fieldsDefault);

  useEffect(() => { setMounted(true); return () => setMounted(false); }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  useEffect(() => {
    if (open) {
      setRecord(() => ({ ...fieldsDefault, ...(initial || {}) }));
    }
  }, [open, initial]);

  const isEditing = !!initial;

  const set = (patch) => setRecord((r) => ({ ...r, ...patch }));

  const addTag = (e) => {
    e.preventDefault();
    const val = e.target.elements.tag.value.trim();
    if (!val) return;
    setRecord((r) => ({ ...r, tags: Array.from(new Set([...(r.tags || []), val])) }));
    e.target.reset();
  };

  const toggleTier = (t) => {
    setRecord((r) => {
      const setT = new Set(r.tier || []);
      setT.has(t) ? setT.delete(t) : setT.add(t);
      return { ...r, tier: Array.from(setT) };
    });
  };

  const onSubmit = (publish) => {
    const rec = { ...record };
    rec.status = publish ? (rec.scheduledAt ? "Scheduled" : "Published") : rec.status || "Draft";
    // basic slug fallback
    rec.seo.slug ||= rec.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    onSave?.(rec);
  };

  if (!open || !mounted) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-[1999]" onClick={onClose} style={{ backgroundColor: "rgba(0,0,0,0.55)" }} />

      <aside className="fixed inset-y-0 right-0 w-[520px] max-w-[96vw] z-[2000] overflow-y-auto"
             style={{ backgroundColor: COLORS.bg2, borderLeft: `1px solid ${COLORS.ring}` }}>
        {/* Header */}
        <div className="p-4 sticky top-0 flex items-center justify-between"
             style={{ backgroundColor: COLORS.bg2, borderBottom: `1px solid ${COLORS.ring}` }}>
          <div>
            <div className="text-sm font-semibold" style={{ color: COLORS.text }}>
              {isEditing ? "Edit Content" : "Create Content"}
            </div>
            <div className="text-xs" style={{ color: COLORS.text2 }}>
              Upload media, set tiers, schedule, and publish.
            </div>
          </div>
          <button className="p-2 rounded-lg" onClick={onClose} aria-label="Close"
                  style={{ color: COLORS.text2, backgroundColor: "transparent" }}>
            <MdClose size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {/* Basic */}
          <div className="rounded-2xl p-4 grid gap-3 sm:grid-cols-2"
               style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.ring}` }}>
            <div className="sm:col-span-2">
              <label className="text-xs" style={{ color: COLORS.text2 }}>Title</label>
              <input
                value={record.title}
                onChange={(e) => set({ title: e.target.value })}
                className="mt-1 w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={{ backgroundColor: "#12131A", color: COLORS.text, border: `1px solid ${COLORS.ring}` }}
                placeholder="Enter content title"
              />
            </div>
            <div>
              <label className="text-xs" style={{ color: COLORS.text2 }}>Category</label>
              <select
                value={record.category}
                onChange={(e) => set({ category: e.target.value })}
                className="mt-1 w-full rounded-lg px-2 h-10 text-sm outline-none"
                style={{ backgroundColor: "#12131A", color: COLORS.text, border: `1px solid ${COLORS.ring}` }}
              >
                {["Real Estate", "Acting & Entertainment", "Finance", "Marketing"].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs" style={{ color: COLORS.text2 }}>Type</label>
              <select
                value={record.type}
                onChange={(e) => set({ type: e.target.value })}
                className="mt-1 w-full rounded-lg px-2 h-10 text-sm outline-none"
                style={{ backgroundColor: "#12131A", color: COLORS.text, border: `1px solid ${COLORS.ring}` }}
              >
                {["video", "article", "audio", "download"].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs" style={{ color: COLORS.text2 }}>Collection / Series</label>
              <input
                value={record.collection}
                onChange={(e) => set({ collection: e.target.value })}
                className="mt-1 w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={{ backgroundColor: "#12131A", color: COLORS.text, border: `1px solid ${COLORS.ring}` }}
                placeholder="e.g., Real Estate 101"
                list="collections-list"
              />
              <datalist id="collections-list">
                {collections.map((c) => <option key={c} value={c} />)}
              </datalist>
            </div>
          </div>

          {/* Media */}
          <div className="rounded-2xl p-4 grid gap-3 sm:grid-cols-2"
               style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.ring}` }}>
            <div>
              <label className="text-xs" style={{ color: COLORS.text2 }}>Cover Image</label>
              <div className="mt-1 grid gap-2">
                <div className="h-28 rounded-lg overflow-hidden bg-black/20 border" style={{ borderColor: COLORS.ring }}>
                  {record.cover ? (
                    <img src={record.cover} alt="cover" className="w-full h-full object-cover" />
                  ) : (
                    <div className="h-full grid place-items-center text-xs" style={{ color: COLORS.text2 }}>
                      No cover uploaded
                    </div>
                  )}
                </div>
                <label className="inline-flex items-center gap-2 text-xs font-medium cursor-pointer"
                       style={{ color: COLORS.text }}>
                  <MdCloudUpload /> Upload
                  <input type="file" className="hidden" accept="image/*"
                         onChange={(e) => {
                           const f = e.target.files?.[0];
                           if (!f) return;
                           const url = URL.createObjectURL(f);
                           set({ cover: url });
                         }} />
                </label>
              </div>
            </div>

            <div>
              <label className="text-xs" style={{ color: COLORS.text2 }}>
                {record.type === "article" ? "Hero Image (optional)" : "Media File / URL"}
              </label>
              <div className="mt-1 grid gap-2">
                {record.type !== "article" ? (
                  <>
                    <input
                      value={record.mediaUrl}
                      onChange={(e) => set({ mediaUrl: e.target.value })}
                      className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                      style={{ backgroundColor: "#12131A", color: COLORS.text, border: `1px solid ${COLORS.ring}` }}
                      placeholder="Paste media URL (S3/CDN) or leave and upload"
                    />
                    <label className="inline-flex items-center gap-2 text-xs font-medium cursor-pointer"
                           style={{ color: COLORS.text }}>
                      <MdCloudUpload /> Upload
                      <input type="file" className="hidden"
                             accept={record.type === "video" ? "video/*" : record.type === "audio" ? "audio/*" : "*"}
                             onChange={(e) => {
                               const f = e.target.files?.[0];
                               if (!f) return;
                               const url = URL.createObjectURL(f);
                               set({ mediaUrl: url });
                             }} />
                    </label>
                  </>
                ) : (
                  <input
                    value={record.mediaUrl}
                    onChange={(e) => set({ mediaUrl: e.target.value })}
                    className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                    style={{ backgroundColor: "#12131A", color: COLORS.text, border: `1px solid ${COLORS.ring}` }}
                    placeholder="Optional hero image URL"
                  />
                )}
              </div>
            </div>

            {record.type !== "article" ? (
              <div>
                <label className="text-xs" style={{ color: COLORS.text2 }}>Duration (minutes)</label>
                <input
                  type="number"
                  value={record.duration}
                  onChange={(e) => set({ duration: Number(e.target.value || 0) })}
                  className="mt-1 w-full rounded-lg px-3 py-2 text-sm outline-none"
                  style={{ backgroundColor: "#12131A", color: COLORS.text, border: `1px solid ${COLORS.ring}` }}
                  min={0}
                />
              </div>
            ) : (
              <div className="sm:col-span-2">
                <label className="text-xs" style={{ color: COLORS.text2 }}>Article Body</label>
                <textarea
                  rows={6}
                  value={record.body}
                  onChange={(e) => set({ body: e.target.value })}
                  className="mt-1 w-full rounded-lg px-3 py-2 text-sm outline-none"
                  style={{ backgroundColor: "#12131A", color: COLORS.text, border: `1px solid ${COLORS.ring}` }}
                  placeholder="Write the article content…"
                />
              </div>
            )}
          </div>

          {/* Tiers & Tags */}
          <div className="rounded-2xl p-4 grid gap-3 sm:grid-cols-2"
               style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.ring}` }}>
            <div>
              <div className="flex items-center gap-2 mb-2 text-xs" style={{ color: COLORS.text2 }}>
                <MdSecurity /> Tier Gating
              </div>
              <div className="flex flex-wrap gap-2">
                {["Free", "Paid", "VIP"].map((t) => (
                  <TogglePill key={t} label={t} active={(record.tier || []).includes(t)} onClick={() => toggleTier(t)} />
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2 text-xs" style={{ color: COLORS.text2 }}>
                <MdTag /> Tags
              </div>
              <form onSubmit={addTag} className="flex items-center gap-2">
                <input
                  name="tag"
                  className="flex-1 rounded-lg px-3 py-2 text-sm outline-none"
                  style={{ backgroundColor: "#12131A", color: COLORS.text, border: `1px solid ${COLORS.ring}` }}
                  placeholder="Add tag and hit Enter"
                />
                <button
                  className="px-3 py-2 rounded-lg text-sm font-medium"
                  style={{ backgroundColor: "#12131A", border: `1px solid ${COLORS.ring}`, color: COLORS.text }}
                >
                  Add
                </button>
              </form>
              <div className="mt-2 flex flex-wrap gap-1">
                {(record.tags || []).map((t) => (
                  <span key={t}
                        className="px-2 py-0.5 rounded-md text-[11px] font-semibold cursor-pointer"
                        title="Click to remove"
                        onClick={() => setRecord((r) => ({ ...r, tags: (r.tags || []).filter((x) => x !== t) }))}
                        style={{ backgroundColor: "rgba(255,255,255,0.06)", color: COLORS.text2, border: `1px solid ${COLORS.ring}` }}>
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Schedule & SEO */}
          <div className="rounded-2xl p-4 grid gap-3 sm:grid-cols-2"
               style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.ring}` }}>
            <div>
              <div className="flex items-center gap-2 mb-2 text-xs" style={{ color: COLORS.text2 }}>
                <MdSchedule /> Schedule
              </div>
              <input
                value={record.scheduledAt || ""}
                onChange={(e) => set({ scheduledAt: e.target.value })}
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={{ backgroundColor: "#12131A", color: COLORS.text, border: `1px solid ${COLORS.ring}` }}
                type="datetime-local"
              />
              <div className="text-[11px] mt-1" style={{ color: COLORS.text2 }}>
                Leave empty to publish immediately.
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2 text-xs" style={{ color: COLORS.text2 }}>
                <MdCategory /> SEO
              </div>
              <input
                value={record.seo.slug}
                onChange={(e) => set({ seo: { ...record.seo, slug: e.target.value } })}
                className="w-full rounded-lg px-3 py-2 text-sm outline-none mb-2"
                style={{ backgroundColor: "#12131A", color: COLORS.text, border: `1px solid ${COLORS.ring}` }}
                placeholder="Slug"
              />
              <input
                value={record.seo.metaTitle}
                onChange={(e) => set({ seo: { ...record.seo, metaTitle: e.target.value } })}
                className="w-full rounded-lg px-3 py-2 text-sm outline-none mb-2"
                style={{ backgroundColor: "#12131A", color: COLORS.text, border: `1px solid ${COLORS.ring}` }}
                placeholder="Meta Title"
              />
              <textarea
                rows={2}
                value={record.seo.metaDescription}
                onChange={(e) => set({ seo: { ...record.seo, metaDescription: e.target.value } })}
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={{ backgroundColor: "#12131A", color: COLORS.text, border: `1px solid ${COLORS.ring}` }}
                placeholder="Meta Description"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              className="px-3 py-2 rounded-xl text-sm font-medium"
              style={{ backgroundColor: "#12131A", border: `1px solid ${COLORS.ring}`, color: COLORS.text }}
              onClick={() => onSubmit(false)}
            >
              Save Draft
            </button>
            <button
              className="px-3 py-2 rounded-xl text-sm font-medium"
              style={{
                background: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.purple})`,
                color: "#0B0B0F",
              }}
              onClick={() => onSubmit(true)}
            >
              {record.scheduledAt ? "Schedule" : "Publish"}
            </button>
          </div>
        </div>
      </aside>
    </>,
    document.body
  );
};

export default ContentDrawer;
