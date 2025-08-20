// src/components/StationPicker.jsx
import { useMemo, useState, useEffect, useRef } from "react";
import { STATIONS } from "../data/stations";

export default function StationPicker({ open, onClose, onSelect }) {
  const [query, setQuery] = useState("");
  const cardRef = useRef(null);

  // close on outside click / ESC
  useEffect(() => {
    function onKey(e){ if (e.key === "Escape") onClose?.(); }
    function onDoc(e){ if (open && cardRef.current && !cardRef.current.contains(e.target)) onClose?.(); }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDoc);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDoc);
    };
  }, [open, onClose]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return STATIONS.slice(0, 20);
    return STATIONS.filter(
      s =>
        s.code.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q)
    ).slice(0, 30);
  }, [query]);

  if (!open) return null;

  return (
    <div className="picker-overlay">
      <div className="picker-card" ref={cardRef}>
        <div className="picker-header">
          <input
            autoFocus
            placeholder="Search station or code (e.g., NDLS, Nagpur)"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button className="picker-close" onClick={onClose}>✕</button>
        </div>

        <div className="picker-list">
          {filtered.map((s) => (
            <div
              key={s.code}
              className="picker-item"
              onClick={() => {
                onSelect(s);
                onClose?.();
              }}
            >
              <div className="code">{s.code}</div>
              <div className="name">{s.name}</div>
            </div>
          ))}
          {filtered.length === 0 && <div className="empty">No matches</div>}
        </div>
      </div>
    </div>
  );
}
