import { isSupabase } from "../../lib/storage";
import { useState } from "react";
import SettingsModal from "./SettingsModal";
import { Settings } from "lucide-react";

export default function TopNav({ view, onViewChange, onImport, onExport }) {
  const [showSettings, setShowSettings] = useState(false);

  const tabBtn = (v, label) => (
    <button
      key={v}
      onClick={() => onViewChange(v)}
      className={`tab-btn${view === v ? " is-active" : ""}`}
    >
      {label}
    </button>
  );

  return (
    <div className="top-nav">
      <span className="top-nav__logo">Трекер</span>

      <div className="top-nav__tabs">
        {tabBtn("week",      "Неделя")}
        {tabBtn("trimester", "Триместр")}
        {tabBtn("stats",     "Статистика")}
        {tabBtn("review",    "Разбор")}
      </div>

      <div className="top-nav__actions">
        <span className={`badge-storage ${isSupabase ? "badge-storage--cloud" : "badge-storage--local"}`}>
          {isSupabase ? "☁ Supabase" : "💾 Local"}
        </span>
        <button onClick={onExport} className="btn-export">↓ Экспорт</button>
        <button onClick={onImport} className="btn-import">+ Импорт</button>
        <button onClick={() => setShowSettings(true)} className="btn-icon-nav">
          <Settings size={16} color="#fff" />
        </button>
      </div>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}
