import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

const getAuthConfig = () => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    withCredentials: true,
  };
};

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString();
};

const formatStatus = (item) => {
  if (item?.isPublished) return "Published";
  if (item?.publishedAt && new Date(item.publishedAt) > new Date()) {
    return "Scheduled";
  }
  return "Draft";
};

const normalizeTier = (accessTier) => {
  if (!accessTier) return ["Free"];

  if (Array.isArray(accessTier)) {
    return accessTier.map((t) =>
      t === "vip" ? "VIP" : t.charAt(0).toUpperCase() + t.slice(1)
    );
  }

  const value = String(accessTier).toLowerCase();

  if (value === "vip") return ["VIP"];
  if (value === "paid") return ["Paid"];
  return ["Free"];
};

const denormalizeTier = (tier) => {
  if (!tier) return "free";

  if (Array.isArray(tier)) {
    const normalized = tier.map((t) => String(t).toLowerCase());
    if (normalized.includes("vip")) return "vip";
    if (normalized.includes("paid")) return "paid";
    return "free";
  }

  const value = String(tier).toLowerCase();
  if (value === "vip") return "vip";
  if (value === "paid") return "paid";
  return "free";
};

const mapContentItem = (item, index = 0) => ({
  id: item?._id || String(index),
  founder: item?.founder || item?.createdBy || "-",
  title: item?.title || "Unknown title",
  slug: item?.slug || "",
  videoUrl: item?.videoUrl || "",
  mediaUrl: item?.videoUrl || item?.mediaUrl || "",
  summary: item?.summary || "",
  category: item?.category || "Uncategorized",
  type: item?.type || "video",
  tier: normalizeTier(item?.accessTier),
  status: formatStatus(item),
  createdAt: item?.createdAt ? formatDate(item.createdAt) : "-",
  scheduledAt: item?.publishedAt ? formatDate(item.publishedAt) : "",
  cover:
    item?.thumbnailUrl ||
    item?.coverImage ||
    item?.image ||
    "https://via.placeholder.com/600x300?text=No+Image",
  duration: item?.durationSeconds
    ? Math.round(item.durationSeconds / 60)
    : 0,
  durationSeconds: item?.durationSeconds || 0,
  views: Number(item?.viewsCount || 0),
  watchTime: Number(item?.watchTime || 0),
  listens: Number(item?.listensCount || 0),
  tags: Array.isArray(item?.tags) ? item.tags : [],
  collection: item?.collection || "",
  isPublished: !!item?.isPublished,
  publishedAt: item?.publishedAt ? formatDate(item.publishedAt) : "-",
  accessTier: item?.accessTier || "free",
  raw: item,
});

const buildPayload = (record) => {
  const isScheduled = !!record?.scheduledAt;

  return {
    title: record?.title?.trim() || "",
    slug: record?.slug?.trim() || "",
    type: record?.type || "video",
    summary: record?.summary?.trim() || "",
    videoUrl: record?.videoUrl || record?.mediaUrl || "",
    thumbnailUrl: record?.thumbnailUrl || record?.cover || "",
    accessTier: record?.accessTier || denormalizeTier(record?.tier),
    category: record?.category || "",
    isPublished: record?.status === "Published" || !!record?.isPublished,
    publishedAt: isScheduled ? new Date(record.scheduledAt).toISOString() : null,
    tags: Array.isArray(record?.tags) ? record.tags : [],
    collection: record?.collection || "",
  };
};

export async function coachingcontent(page = 1, limit = 20) {
  try {
    const res = await axios.get(
      `${API_BASE}/coaching/admin/content?page=${page}&limit=${limit}`,
      getAuthConfig()
    );

    console.log("coaching content api response:", res.data);

    const rows = Array.isArray(res?.data?.data?.items)
      ? res.data.data.items
      : Array.isArray(res?.data?.data)
        ? res.data.data
        : [];

    return rows.map((item, index) => mapContentItem(item, index));
  } catch (error) {
    throw new Error(
      error?.response?.data?.message || "Failed to fetch coaching content"
    );
  }
}

export async function createCoachingContent(record) {
  try {
    const token = localStorage.getItem("token");
    const formData = new FormData();

    const shouldPublishNow =
      record?.status === "Published" && !record?.scheduledAt;

    formData.append("title", record?.title?.trim() || "");
    formData.append("slug", record?.slug?.trim() || "");
    formData.append("type", record?.type || "video");
    formData.append("summary", record?.summary?.trim() || "");
    formData.append(
      "accessTier",
      record?.accessTier || denormalizeTier(record?.tier)
    );
    formData.append("category", record?.category || "");
    formData.append("isPublished", String(shouldPublishNow));

    if (record?.scheduledAt) {
      formData.append(
        "publishedAt",
        new Date(record.scheduledAt).toISOString()
      );
    }

    if (record?.mediaUrl && !record?.videoFile) {
      formData.append("videoUrl", record.mediaUrl);
    }

    if (record?.collection) {
      formData.append("collection", record.collection);
    }

    if (Array.isArray(record?.tags)) {
      record.tags.forEach((tag, index) => {
        formData.append(`tags[${index}]`, tag);
      });
    }

    if (record?.thumbnailFile) {
      formData.append("thumbnail", record.thumbnailFile);
    }

    if (record?.videoFile) {
      formData.append("video", record.videoFile);
    }

    const res = await axios.post(
      `${API_BASE}/coaching/admin/content`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      }
    );

    const item =
      res?.data?.data?.item ||
      res?.data?.data ||
      res?.data?.item ||
      res?.data;

    return mapContentItem(item);
  } catch (error) {
    throw new Error(
      error?.response?.data?.message || "Failed to create coaching content"
    );
  }
}

export async function updateCoachingContent(id, record) {
  try {
    const token = localStorage.getItem("token");

    const formData = new FormData();

    formData.append("title", record?.title?.trim() || "");
    formData.append("slug", record?.slug?.trim() || "");
    formData.append("type", record?.type || "video");
    formData.append("summary", record?.summary?.trim() || "");
    formData.append("accessTier", record?.accessTier || denormalizeTier(record?.tier));
    formData.append("category", record?.category || "");
    formData.append(
      "isPublished",
      String(
        record?.status === "Published" ||
        record?.status === "Scheduled" ||
        !!record?.isPublished
      )
    );

    if (record?.mediaUrl && !record?.videoFile) {
      formData.append("videoUrl", record.mediaUrl);
    }

    if (record?.collection) {
      formData.append("collection", record.collection);
    }

    if (Array.isArray(record?.tags)) {
      record.tags.forEach((tag, index) => {
        formData.append(`tags[${index}]`, tag);
      });
    }

    if (record?.thumbnailFile) {
      formData.append("thumbnail", record.thumbnailFile);
    }

    if (record?.videoFile) {
      formData.append("video", record.videoFile);
    }
    if (record?.scheduledAt) {
      formData.append(
        "publishedAt",
        new Date(record.scheduledAt).toISOString()
      );
    }

    const res = await axios.put(
      `${API_BASE}/coaching/admin/content/${id}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      }
    );

    const item =
      res?.data?.data?.item ||
      res?.data?.data ||
      res?.data?.item ||
      res?.data;

    return mapContentItem(item);
  } catch (error) {
    throw new Error(
      error?.response?.data?.message || "Failed to update coaching content"
    );
  }
}

export async function deleteCoachingContent(id) {
  try {
    const res = await axios.delete(
      `${API_BASE}/coaching/admin/content/${id}`,
      getAuthConfig()
    );

    console.log("delete coaching content response:", res.data);

    return {
      success: true,
      id,
      message: res?.data?.message || "Content deleted successfully",
    };
  } catch (error) {
    throw new Error(
      error?.response?.data?.message || "Failed to delete coaching content"
    );
  }
}
export async function publishCoachingContent(id) {
  try {
    const res = await axios.patch(
      `${API_BASE}/coaching/admin/contentpublish/${id}`,
      {},
      getAuthConfig()
    );

    console.log("publish coaching content response:", res.data);

    const item =
      res?.data?.data?.item ||
      res?.data?.data ||
      res?.data?.item ||
      res?.data;

    return mapContentItem(item);
  } catch (error) {
    throw new Error(
      error?.response?.data?.message || "Failed to publish coaching content"
    );
  }
}

export async function unpublishCoachingContent(id) {
  try {
    const res = await axios.patch(
      `${API_BASE}/coaching/admin/contentunpublish/${id}`,
      {},
      getAuthConfig()
    );

    console.log("unpublish coaching content response:", res.data);

    const item =
      res?.data?.data?.item ||
      res?.data?.data ||
      res?.data?.item ||
      res?.data;

    return mapContentItem(item);
  } catch (error) {
    throw new Error(
      error?.response?.data?.message || "Failed to unpublish coaching content"
    );
  }
}