import React, { useState } from "react";
import OffersBoard from "../Components/ptm/OffersBoard";
import OfferDrawer from "../Components/ptm/OfferDrawer";
import OfferDetails from "../Components/ptm/OfferDetails";

const COLORS = {
  text: "#E6E8F0",
  text2: "#A3A7B7",
  card: "#161821",
  ring: "rgba(110,86,207,0.25)",
  gold: "#D4AF37",
  purple: "#6E56CF",
};

/** ---------- Mock Seed Data ---------- */
const SEED_OFFERS = [
  {
    id: "of_1001",
    title: "20% off All-Day Breakfast",
    brand: "McDonald's",
    category: "Dining",
    tiers: ["Paid", "VIP"],
    status: "Active", // Active | Paused | Expired | Draft
    codeType: "code", // code | qr
    codeValue: "MC-SSL-20",
    perUserLimit: 2,
    totalLimit: 5000,
    validFrom: "2025-08-01",
    validTo: "2025-09-30",
    geo: {
      cities: [
        { name: "New York, US", radiusKm: 50 },
        { name: "Miami, US", radiusKm: 40 },
      ],
      radiusDefaultKm: 50,
    },
    vendor: {
      id: "v_mcd",
      logo: "https://upload.wikimedia.org/wikipedia/commons/5/59/McDonald%27s_logo.svg",
      contact: "partners@mcdonalds.com",
      website: "https://www.mcdonalds.com",
    },
    redemptions: {
      byCity: { "New York, US": 812, "Miami, US": 356 },
      byTier: { Free: 0, Paid: 640, VIP: 528 },
      total: 1168,
    },
    createdAt: "2025-07-15",
    updatedAt: "2025-08-18",
  },
  {
    id: "of_1002",
    title: "Up to 18% off Rooms",
    brand: "Marriott",
    category: "Travel",
    tiers: ["Paid", "VIP"],
    status: "Active",
    codeType: "qr",
    codeValue: "MARRIOTT-SSL-QR-8823",
    perUserLimit: 1,
    totalLimit: 2000,
    validFrom: "2025-08-05",
    validTo: "2025-12-31",
    geo: {
      cities: [
        { name: "Dubai, AE", radiusKm: 60 },
        { name: "London, UK", radiusKm: 50 },
      ],
      radiusDefaultKm: 50,
    },
    vendor: {
      id: "v_marriott",
      logo: "https://upload.wikimedia.org/wikipedia/commons/1/1a/Marriott_hotels_logo14.svg",
      contact: "partners@marriott.com",
      website: "https://www.marriott.com",
    },
    redemptions: {
      byCity: { "Dubai, AE": 205, "London, UK": 122 },
      byTier: { Free: 0, Paid: 180, VIP: 147 },
      total: 327,
    },
    createdAt: "2025-07-20",
    updatedAt: "2025-08-10",
  },
  {
    id: "of_1003",
    title: "2-for-1 Large Pizzas (Weekdays)",
    brand: "Papa John's",
    category: "Dining",
    tiers: ["Free", "Paid", "VIP"],
    status: "Paused",
    codeType: "code",
    codeValue: "PJ-241-SSL",
    perUserLimit: 4,
    totalLimit: 8000,
    validFrom: "2025-06-01",
    validTo: "2025-08-31",
    geo: {
      cities: [{ name: "Los Angeles, US", radiusKm: 70 }],
      radiusDefaultKm: 50,
    },
    vendor: {
      id: "v_pj",
      logo: "https://upload.wikimedia.org/wikipedia/commons/1/1d/Papa_John%27s_logo.svg",
      contact: "affiliates@papajohns.com",
      website: "https://www.papajohns.com",
    },
    redemptions: {
      byCity: { "Los Angeles, US": 590 },
      byTier: { Free: 220, Paid: 270, VIP: 100 },
      total: 590,
    },
    createdAt: "2025-05-22",
    updatedAt: "2025-08-01",
  },
];

const DealsPartnersPage = () => {
  const [offers, setOffers] = useState(SEED_OFFERS);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [active, setActive] = useState(null);

  // PTM sync mock state
  const [sync, setSync] = useState({
    status: "Idle",
    lastSync: "2025-08-18 14:35",
    logs: [
      {
        ts: "2025-08-18 14:35",
        msg: "Fetched 2 new offers, updated 4, 0 errors.",
      },
      {
        ts: "2025-08-15 09:12",
        msg: "PTM endpoint latency high (2.1s). Retried once.",
      },
    ],
  });

  const onCreate = () => {
    setEditing(null);
    setDrawerOpen(true);
  };
  const onEdit = (offer) => {
    setEditing(offer);
    setDrawerOpen(true);
  };
  const onSelect = (offer) => setActive(offer);

  const upsert = (record) => {
    setOffers((prev) => {
      const exists = prev.some((o) => o.id === record.id);
      if (exists) return prev.map((o) => (o.id === record.id ? record : o));
      const id = `of_${Math.floor(Math.random() * 9000) + 1000}`;
      return [{ ...record, id }, ...prev];
    });
    setDrawerOpen(false);
  };

  const onExport = (rows) => {
    const headers = [
      "ID",
      "Title",
      "Brand",
      "Category",
      "Tiers",
      "Status",
      "CodeType",
      "CodeValue",
      "PerUserLimit",
      "TotalLimit",
      "ValidFrom",
      "ValidTo",
      "Cities",
      "TotalRedemptions",
    ];
    const source = rows?.length ? rows : offers;
    const lines = source.map((o) => [
      o.id,
      o.title,
      o.brand,
      o.category,
      (o.tiers || []).join("|"),
      o.status,
      o.codeType,
      o.codeValue,
      o.perUserLimit,
      o.totalLimit,
      o.validFrom,
      o.validTo,
      (o.geo?.cities || [])
        .map((c) => `${c.name} (${c.radiusKm}km)`)
        .join("; "),
      o.redemptions?.total || 0,
    ]);
    const csv = [headers, ...lines]
      .map((r) =>
        r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ptm_offers_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const setStatus = (id, status) => {
    setOffers((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  const simulateSync = () => {
    setSync((s) => ({ ...s, status: "Syncing..." }));
    setTimeout(() => {
      setSync((s) => ({
        status: "Idle",
        lastSync: new Date().toISOString().replace("T", " ").slice(0, 16),
        logs: [
          {
            ts: new Date().toISOString().replace("T", " ").slice(0, 16),
            msg: "Synced successfully: updated 1 offer.",
          },
          ...s.logs,
        ].slice(0, 10),
      }));
    }, 800);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1
          className="text-xl md:text-2xl font-semibold"
          style={{ color: COLORS.text }}
        >
          Deals & Partners (PTM)
        </h1>
        <div className="flex items-center gap-2">
          <div
            className="rounded-xl px-3 py-2 text-xs"
            style={{
              backgroundColor: "#12131A",
              border: `1px solid ${COLORS.ring}`,
              color: COLORS.text2,
            }}
          >
            PTM: <span className="font-semibold">{sync.status}</span> • Last:{" "}
            {sync.lastSync}
          </div>
          <button
            className="px-3 py-2 rounded-xl text-sm font-medium"
            style={{
              background: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.purple})`,
              color: "#0B0B0F",
            }}
            onClick={simulateSync}
          >
            Sync Now
          </button>
        </div>
      </div>

      <OffersBoard
        data={offers}
        onCreate={onCreate}
        onEdit={onEdit}
        onSelect={onSelect}
        onExport={onExport}
      />

      <OfferDrawer
        open={drawerOpen}
        initial={editing}
        onClose={() => setDrawerOpen(false)}
        onSave={upsert}
      />

      <OfferDetails
        item={active}
        onClose={() => setActive(null)}
        onEdit={() => {
          setEditing(active);
          setActive(null);
          setDrawerOpen(true);
        }}
        onSetStatus={setStatus}
        onExportOne={() => onExport([active])}
        sync={sync}
      />
    </div>
  );
};

export default DealsPartnersPage;
