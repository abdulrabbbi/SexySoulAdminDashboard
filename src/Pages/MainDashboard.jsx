import React, { useMemo } from "react";
import KpiTiles from "../Components/dashboard/KpiTiles";
import TrendsMini from "../Components/dashboard/TrendsMini";
import ActivityFeed from "../Components/dashboard/ActivityFeed";
import QuickActions from "../Components/dashboard/QuickActions";
import SystemHealth from "../Components/dashboard/SystemHealth";

const COLORS = {
  bg: "#0B0B0F",
  bg2: "#12131A",
  card: "#161821",
  text: "#E6E8F0",
  text2: "#A3A7B7",
  gold: "#D4AF37",
  purple: "#6E56CF",
  ring: "rgba(110,86,207,0.25)",
};

const DashboardContent = () => {
  // --- Mock KPI data (replace from API later) ---
  const kpis = useMemo(
    () => [
      { key: "mau", label: "MAU", value: 239000, change: 6.08 }, // Monthly Active Users
      { key: "new_signups", label: "New Signups", value: 1156, change: 15.03 },
      {
        key: "conversion",
        label: "Paid/VIP Conversion",
        value: 7.2,
        change: 0.42,
        isPercent: true,
      },
      {
        key: "churn",
        label: "Churn",
        value: 2.4,
        change: -0.18,
        isPercent: true,
      },
      {
        key: "arpu",
        label: "ARPU",
        value: 19.95,
        change: 1.12,
        isCurrency: true,
      },
    ],
    []
  );

  // --- CSV export for KPIs ---
  const exportKpis = () => {
    const headers = ["Metric", "Value", "Change"];
    const rows = kpis.map((k) => {
      const v = k.isCurrency
        ? `$${k.value.toFixed(2)}`
        : k.isPercent
        ? `${k.value.toFixed(2)}%`
        : k.value.toLocaleString();
      const c = `${k.change >= 0 ? "+" : ""}${k.change.toFixed(2)}%`;
      return [k.label, v, c];
    });
    const csv = [headers, ...rows]
      .map((r) => r.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kpis_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // --- Mock trends data ---
  const trends = {
    subs: [
      { m: "Jan", cur: 1200, prev: 980 },
      { m: "Feb", cur: 1320, prev: 1100 },
      { m: "Mar", cur: 1500, prev: 1200 },
      { m: "Apr", cur: 1625, prev: 1350 },
      { m: "May", cur: 1810, prev: 1500 },
      { m: "Jun", cur: 2010, prev: 1650 },
      { m: "Jul", cur: 2230, prev: 1800 },
    ],
    revenue: [
      { m: "Jan", cur: 12.4, prev: 11.8 },
      { m: "Feb", cur: 13.1, prev: 12.2 },
      { m: "Mar", cur: 14.8, prev: 13.0 },
      { m: "Apr", cur: 15.3, prev: 13.9 },
      { m: "May", cur: 16.7, prev: 14.8 },
      { m: "Jun", cur: 18.9, prev: 16.2 },
      { m: "Jul", cur: 21.2, prev: 18.1 },
    ], // $ in 000s
    engagement: [
      { m: "Jan", cur: 28, prev: 22 },
      { m: "Feb", cur: 31, prev: 25 },
      { m: "Mar", cur: 34, prev: 27 },
      { m: "Apr", cur: 36, prev: 28 },
      { m: "May", cur: 39, prev: 30 },
      { m: "Jun", cur: 43, prev: 33 },
      { m: "Jul", cur: 47, prev: 36 },
    ], // avg minutes/session
    redemptions: [
      { m: "Jan", cur: 220, prev: 180 },
      { m: "Feb", cur: 240, prev: 195 },
      { m: "Mar", cur: 260, prev: 210 },
      { m: "Apr", cur: 300, prev: 230 },
      { m: "May", cur: 340, prev: 250 },
      { m: "Jun", cur: 390, prev: 280 },
      { m: "Jul", cur: 450, prev: 315 },
    ],
  };

  // --- Mock activity items ---
  const activity = [
    {
      id: 1,
      title: "Published coaching video",
      by: "Russell Davis",
      when: "2h ago",
    },
    { id: 2, title: "PTM sync completed", by: "System", when: "4h ago" },
    {
      id: 3,
      title: "Created event: VIP Mixer",
      by: "Guy Fortt",
      when: "Yesterday",
    },
    {
      id: 4,
      title: "Broker payout batch sent",
      by: "Finance",
      when: "2 days ago",
    },
    {
      id: 5,
      title: "New podcast episode",
      by: "Calvin Richardson",
      when: "3 days ago",
    },
  ];

  // --- Mock system health ---
  const health = {
    ptm: { status: "Operational", lastSync: "Today 09:15", incidents: 0 },
    payments: { status: "Operational", lastSync: "Today 09:10", incidents: 0 },
    webhooks: { status: "Degraded", lastSync: "Today 08:51", incidents: 1 },
  };

  return (
    <div className="space-y-5">
      {/* Top bar: title + export */}
      <div className="flex items-center justify-between">
        <h1
          className="text-xl md:text-2xl font-semibold"
          style={{ color: COLORS.text }}
        >
          Dashboard Overview
        </h1>
        <button
          onClick={exportKpis}
          className="px-3 py-2 rounded-xl text-sm font-medium"
          style={{
            background: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.purple})`,
            color: COLORS.bg,
          }}
        >
          Export KPIs (CSV)
        </button>
      </div>

      {/* KPI tiles */}
      <KpiTiles kpis={kpis} />

      {/* Trends grid */}
      <TrendsMini data={trends} />

      {/* Activity + Quick actions */}
      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-5">
        <ActivityFeed items={activity} />
        <QuickActions />
      </div>

      {/* System health */}
      {/* <SystemHealth health={health} /> */}
    </div>
  );
};

export default DashboardContent;
