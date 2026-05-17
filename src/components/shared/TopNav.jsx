import { isSupabase } from "../../lib/storage";
import { useState } from "react";
import SettingsModal from "./SettingsModal";
import { Settings } from "lucide-react";


export default function TopNav({ view, onViewChange, onImport, onExport }) {
  const [showSettings, setShowSettings] = useState(false);
  const tabBtn = (v, label) => (
    <button
      onClick={() => onViewChange(v)}
      style={{
        padding: "6px 14px", fontSize: 13, borderRadius: 8,
        border: "none", fontWeight: 500, cursor: "pointer",
        background: view === v ? "#76A5AF" : "transparent",
        color: view === v ? "#fff" : "rgba(255,255,255,0.55)",
        transition: "all 0.15s",
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "#2C5F6A",
      padding: "12px 16px",
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
    }}>
      <span style={{ fontSize: 15, fontWeight: 700, color: "#fff", letterSpacing: "-0.01em", flexShrink: 0 }}>
        Трекер
      </span>

      <div style={{ display: "flex", background: "rgba(255,255,255,0.1)", borderRadius: 10, padding: 3, gap: 2 }}>
        {tabBtn("week", "Неделя")}
        {tabBtn("trimester", "Триместр")}
        {tabBtn("stats", "Статистика")}
        {tabBtn("review",    "Разбор")}
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <span style={{ fontSize: 10, color: isSupabase ? "#B8D6DC" : "#FCD34D", fontWeight: 500, flexShrink: 0 }}>
          {isSupabase ? "☁ Supabase" : "💾 Local"}
        </span>
        <button onClick={onExport} style={{ background: "rgba(255,255,255,0.12)", border: "none", borderRadius: 8, padding: "6px 10px", color: "#fff", fontSize: 12, cursor: "pointer", fontWeight: 500 }}>
          ↓ Экспорт
        </button>
        <button onClick={onImport} style={{ background: "#76A5AF", border: "none", borderRadius: 8, padding: "6px 12px", color: "#fff", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>
          + Импорт
        </button>
        <button
          onClick={() => setShowSettings(true)}
          style={{ background: "transparent", border: "none", borderRadius: 8, padding: "4px 4px", color: "#fff", fontSize: 12, cursor: "pointer" }}
        >
          <Settings size={16} color="#fff" />
        </button>
      </div>
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}