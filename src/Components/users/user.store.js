import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

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

const formatRole = (role) => {
  const value = (role || "").toLowerCase();
  if (value === "admin") return "Admin";
  if (value === "broker") return "Broker";
  return "User";
};

const formatTier = (membershipTier) => {
  const value = (membershipTier || "").toLowerCase();
  if (value === "vip") return "VIP";
  if (value === "paid") return "Paid";
  if (value === "trial") return "Trial";
  return "Free";
};

const formatSubscription = (membershipTier, status) => {
  const tier = formatTier(membershipTier);
  const normalizedStatus = (status || "").toLowerCase();

  if (normalizedStatus !== "active") {
    return {
      status: "Cancelled",
      plan: tier === "Free" ? "Free Plan" : `${tier} Plan`,
      nextInvoiceAt: null,
      amount: 0,
    };
  }

  if (tier === "Trial") {
    return {
      status: "Trial",
      plan: "Trial Plan",
      nextInvoiceAt: null,
      amount: 0,
    };
  }

  return {
    status: "Active",
    plan: tier === "Free" ? "Free Plan" : `${tier} Plan`,
    nextInvoiceAt: null,
    amount: 0,
  };
};

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString();
};

const mapUser = (item, index = 0) => ({
  id: item?._id || String(index),
  userId: item?._id || "-",
  name: item?.username || item?.name || "Unknown User",
  email: item?.email || "",
  avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
    item?.username || item?.name || "User"
  )}&background=1f2937&color=ffffff`,
  role: formatRole(item?.role),
  tier: formatTier(item?.membershipTier),
  subscription: formatSubscription(item?.membershipTier, item?.status),
  lastActive: item?.updatedAt ? formatDate(item.updatedAt) : "-",
  joinedAt: item?.createdAt ? formatDate(item.createdAt) : "-",
  brokerId: item?.brokerId || null,
  invoices: [],
  devices: [],
  notes: "",
  audit: [],
  theme: item?.theme || "light",
  language: item?.language || "en-US",
  linkedAccounts: item?.linkedAccounts || [],
  rawStatus: item?.status || "active",
});

export async function getUsers(page = 1) {
  try {
    const res = await axios.get(`${API_BASE}/users?page=${page}`, getAuthConfig());

    console.log("users api response:", res.data);

    const rows = Array.isArray(res?.data?.data?.items)
      ? res.data.data.items
      : [];

    return rows.map((item, index) => mapUser(item, index));
  } catch (error) {
    throw new Error(
      error?.response?.data?.message || "Failed to fetch users"
    );
  }
}

export async function createUser(payload) {
  try {
    const res = await axios.post(
      `${API_BASE}/users/createUser/`,
      {
        username: payload?.username?.trim() || "",
        fullname: payload?.fullname?.trim() || "",
        password: payload?.password || "",
        email: payload?.email?.trim() || "",
        role: (payload?.role || "User").toLowerCase(),
        status: (payload?.status || "Active").toLowerCase(),
      },
      getAuthConfig()
    );

    const item =
      res?.data?.data?.item ||
      res?.data?.data?.user ||
      res?.data?.data ||
      res?.data?.user ||
      res?.data;

    return mapUser(item);
  } catch (error) {
    throw new Error(
      error?.response?.data?.message || "Failed to create user"
    );
  }
}