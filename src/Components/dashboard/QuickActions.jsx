import React from "react";
import { Link } from "react-router-dom";
import { MdAddCircle, MdUploadFile, MdCampaign, MdLocalOffer } from "react-icons/md";

const COLORS = {
  card: "#161821",
  text: "#E6E8F0",
  text2: "#A3A7B7",
  ring: "rgba(110,86,207,0.25)",
  gold: "#D4AF37",
  purple: "#6E56CF",
};

const ActionBtn = ({ to, Icon, label }) => (
  <Link
    to={to}
    className="flex items-center justify-between rounded-xl px-4 py-3 transition"
    style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.ring}`, color: COLORS.text }}
  >
    <div className="flex items-center gap-3">
      <span
        className="w-9 h-9 rounded-lg grid place-items-center"
        style={{
          background: `linear-gradient(135deg, ${COLORS.gold}, ${COLORS.purple})`,
          color: "#0B0B0F",
        }}
      >
        <Icon size={18} />
      </span>
      <span className="text-sm font-medium">{label}</span>
    </div>
    <span className="text-xs" style={{ color: COLORS.text2 }}>
      →
    </span>
  </Link>
);

const QuickActions = () => {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <ActionBtn to="/live-events/new" Icon={MdAddCircle} label="Create Event" />
      <ActionBtn to="/content/new" Icon={MdUploadFile} label="Upload Coaching" />
      <ActionBtn to="/messaging/compose" Icon={MdCampaign} label="Send Broadcast" />
      <ActionBtn to="/deals/new" Icon={MdLocalOffer} label="Add Discount" />
    </div>
  );
};

export default QuickActions;
