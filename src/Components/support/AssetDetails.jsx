/* eslint-disable no-empty */
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { IoClose } from "react-icons/io5";
import { MdContentCopy } from "react-icons/md";
import { COLORS } from "../../Pages/SupportMediaSettingsPage";

const AssetDetails = ({ open, asset, onClose, onReplace }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); return () => setMounted(false); }, []);
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!mounted) return null;

  const copy = async (txt) => {
    try { await navigator.clipboard.writeText(txt); alert("Copied!"); } catch {}
  };

  return createPortal(
    <>
      <div className={`fixed inset-0 z-[2999] ${open ? "block" : "hidden"}`} onClick={onClose} style={{ backgroundColor: "rgba(0,0,0,0.55)" }} />
      <aside
        className={`fixed inset-y-0 right-0 w-[860px] max-w-[98vw] z-[3000] overflow-y-auto transition-transform duration-200
                    ${open ? "translate-x-0" : "translate-x-full"}`}
        style={{ backgroundColor: COLORS.bg2, borderLeft: `1px solid ${COLORS.ring}`, color: COLORS.text }}
        aria-hidden={!open}
      >
        <div className="p-4 sticky top-0 flex items-center justify-between"
             style={{ backgroundColor: COLORS.bg2, borderBottom: `1px solid ${COLORS.ring}` }}>
          <div>
            <div className="text-sm font-semibold">{asset?.name || "Asset"}</div>
            <div className="text-xs" style={{ color: COLORS.text2 }}>
              {asset?.type?.toUpperCase()} • v{asset?.version} • {asset?.size}
            </div>
          </div>
          <button className="p-2 rounded-lg" onClick={onClose} aria-label="Close" style={{ color: COLORS.text2 }}>
            <IoClose size={20} />
          </button>
        </div>

        <div className="p-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          {/* left: preview + usage */}
          <div className="space-y-4">
            <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.ring}` }}>
              {asset?.preview ? (
                <img src={asset.preview} alt={asset?.name} className="w-full h-64 object-cover" />
              ) : (
                <div className="h-64 grid place-items-center" style={{ color: COLORS.text2 }}>
                  No preview
                </div>
              )}
            </div>

            <div className="rounded-2xl p-4" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.ring}` }}>
              <div className="text-sm font-semibold">Usage</div>
              <ul className="mt-2 space-y-2 text-sm">
                {(asset?.usage || []).map((u, i) => <li key={i}>• {u}</li>)}
                {!(asset?.usage || []).length && <li className="text-xs" style={{ color: COLORS.text2 }}>No usages recorded.</li>}
              </ul>
            </div>
          </div>

          {/* right: meta + versions */}
          <div className="space-y-4">
            <div className="rounded-2xl p-4 space-y-3" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.ring}` }}>
              <div className="text-sm font-semibold">CDN</div>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={asset?.cdn || ""}
                  className="flex-1 rounded-lg px-3 h-10 text-sm outline-none"
                  style={{ backgroundColor: "#12131A", color: COLORS.text, border: `1px solid ${COLORS.ring}` }}
                />
                <button
                  className="px-3 h-10 rounded-lg text-sm font-semibold inline-flex items-center gap-2"
                  style={{ backgroundColor: "#12131A", border: `1px solid ${COLORS.ring}`, color: COLORS.text }}
                  onClick={() => copy(asset?.cdn || "")}
                >
                  <MdContentCopy /> Copy
                </button>
              </div>
              <div className="flex items-center justify-end">
                <button
                  className="px-3 py-2 rounded-xl text-sm font-medium"
                  style={{ background: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.purple})`, color: "#0B0B0F" }}
                  onClick={onReplace}
                >
                  Replace
                </button>
              </div>
            </div>

            <div className="rounded-2xl p-4" style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.ring}` }}>
              <div className="text-sm font-semibold">Versions</div>
              <ul className="mt-2 space-y-2">
                {(asset?.versions || []).map((v) => (
                  <li key={v.v} className="flex items-center justify-between text-sm">
                    <span>v{v.v}</span>
                    <span style={{ color: COLORS.text2 }}>{v.at}</span>
                  </li>
                ))}
                {!(asset?.versions || []).length && <li className="text-xs" style={{ color: COLORS.text2 }}>No versions.</li>}
              </ul>
              <div className="text-xs mt-3" style={{ color: COLORS.text2 }}>
                Versioning is illustrative here; wire to your storage to manage actual file versions.
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>,
    document.body
  );
};

export default AssetDetails;
