import React, { useEffect, useMemo, useState } from "react";
import ContentTable from "../Components/content/ContentTable";
import ContentDrawer from "../Components/content/ContentDrawer";
import ContentDetails from "../Components/content/ContentDetails";

import {
  coachingcontent,
  createCoachingContent,
  updateCoachingContent,
  deleteCoachingContent,
  publishCoachingContent,
  unpublishCoachingContent
} from "../Components/content/Content.store";

const COLORS = {
  text: "#E6E8F0",
  card: "#161821",
  ring: "rgba(110,86,207,0.25)",
  gold: "#D4AF37",
  purple: "#6E56CF",
};

const ContentPage = () => {
  const [items, setItems] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchContent = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await coachingcontent(1, 20);
      console.log("mapped coaching content:", data);
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("fetch coaching content error:", err);
      setError(err.message || "Failed to load content");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const collections = useMemo(
    () => Array.from(new Set(items.map((i) => i.collection).filter(Boolean))),
    [items]
  );

  const onCreate = () => {
    setEditing(null);
    setDrawerOpen(true);
  };

  const onEdit = (row) => {
    setEditing(row);
    setDrawerOpen(true);
  };

  const onSave = async (record) => {
    try {
      console.log("Saving content:", record);

      let savedItem;
      if (editing?.id) {
        // UPDATE
        savedItem = await updateCoachingContent(editing.id, record);

        setItems((prev) =>
          prev.map((item) =>
            item.id === editing.id ? savedItem : item
          )
        );
      } else {
        // CREATE
        savedItem = await createCoachingContent(record);

        setItems((prev) => [savedItem, ...prev]);
      }

      setDrawerOpen(false);
      setEditing(null);
    } catch (err) {
      console.error("Save content error:", err);
      alert(err.message || "Failed to save content");
    }
  };
  const onDeleteOne = async (id) => {
    try {
      await deleteCoachingContent(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch (err) {
      console.error("Delete content error:", err);
      alert(err.message || "Failed to delete content");
    }
  };

  const onBulkDelete = async (ids) => {
    try {
      await Promise.all(ids.map((id) => deleteCoachingContent(id)));
      setItems((prev) => prev.filter((x) => !ids.includes(x.id)));
    } catch (err) {
      console.error("Bulk delete content error:", err);
      alert(err.message || "Failed to delete selected content");
    }
  };
  const onBulkPublish = async (ids) => {
  try {
    const updatedRows = await Promise.all(
      ids.map((id) => publishCoachingContent(id))
    );

    setItems((prev) =>
      prev.map((item) => updatedRows.find((u) => u.id === item.id) || item)
    );
  } catch (err) {
    console.error("bulk publish content error:", err);
    alert(err.message || "Failed to publish selected content");
  }
};
const onBulkUnpublish = async (ids) => {
  try {
    const updatedRows = await Promise.all(
      ids.map((id) => unpublishCoachingContent(id))
    );

    setItems((prev) =>
      prev.map((item) => updatedRows.find((u) => u.id === item.id) || item)
    );
  } catch (err) {
    console.error("bulk unpublish content error:", err);
    alert(err.message || "Failed to unpublish selected content");
  }
};
  const onExport = (rows) => {
    const headers = [
      "ID",
      "Title",
      "Category",
      "Type",
      "Status",
      "Tiers",
      "Duration(min)",
      "Created",
      "Scheduled",
      "Tags",
      "Collection",
      "Views",
      "WatchTime(min)",
      "Listens",
    ];

    const lines = (rows.length ? rows : items).map((r) => [
      r.id,
      r.title,
      r.category,
      r.type,
      r.status,
      (r.tier || []).join("|"),
      r.duration || 0,
      r.createdAt || "",
      r.scheduledAt || "",
      (r.tags || []).join("|"),
      r.collection || "",
      r.views || 0,
      r.watchTime || 0,
      r.listens || 0,
    ]);

    const csv = [headers, ...lines]
      .map((row) =>
        row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `content_export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1
          className="text-xl md:text-2xl font-semibold"
          style={{ color: COLORS.text }}
        >
          Content (Coaching & Podcasts)
        </h1>
        <button
          onClick={onCreate}
          className="px-3 py-2 rounded-xl text-sm font-medium"
          style={{
            background: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.purple})`,
            color: "#0B0B0F",
          }}
        >
          New Content
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-sm text-gray-400">Loading content...</div>
      ) : (
        <ContentTable
          data={items}
          onEdit={onEdit}
          onDetails={(r) => setDetails(r)}
          onExport={onExport}
          onBulkDelete={(ids) =>
            onBulkDelete(ids)
          }
          onBulkPublish={onBulkPublish}
          onBulkUnpublish={onBulkUnpublish}
        />
      )}

      <ContentDrawer
        open={drawerOpen}
        initial={editing}
        collections={collections}
        onClose={() => setDrawerOpen(false)}
        onSave={onSave}
      />

      <ContentDetails
        item={details}
        onClose={() => setDetails(null)}
        onEdit={() => {
          setEditing(details);
          setDetails(null);
          setDrawerOpen(true);
        }}
      />
    </div>
  );
};

export default ContentPage;