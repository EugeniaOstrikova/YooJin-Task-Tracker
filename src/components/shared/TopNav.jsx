import { isSupabase } from "../../lib/storage";

export default function TopNav({ view, onViewChange, onImport, onExport }) {
  const tabBtn = (v, label) => (
    <button
      onClick={() => onViewChange(v)}
      style={{
        padding:    "6px 14px",
        fontSize:   13,
        borderRadius: 8,
        border:     "none",
        fontWeight: 500,
        cursor:     "pointer",
        background: view === v ? "#fff"         : "transparent",
        color:      view === v ? "#0F172A"      : "rgba(255,255,255,0.6)",
        boxShadow:  view === v ? "0 1px 4px rgba(0,0,0,0.12)" : "none",
        transition: "all 0.15s",
      }}
    >
      {label}
    </button>
  );

  return (
    <div
      style={{
        position:       "sticky",
        top:            0,
        zIndex:         100,
        background:     "#0F172A",
        padding:        "12px 16px",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "space-between",
        gap:            12,
      }}
    >
      {/* Логотип */}
      <span style={{ fontSize: 15, fontWeight: 700, color: "#fff", letterSpacing: "-0.01em", flexShrink: 0 }}>
        Трекер
      </span>

      {/* Переключатель видов */}
      <div style={{ display: "flex", background: "rgba(255,255,255,0.1)", borderRadius: 10, padding: 3, gap: 2 }}>
        {tabBtn("week",      "Неделя")}
        {tabBtn("trimester", "Триместр")}
      </div>

      {/* Действия */}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {/* Индикатор хранилища */}
        <span style={{ fontSize: 10, color: isSupabase ? "#86EFAC" : "#FCD34D", fontWeight: 500, flexShrink: 0 }}>
          {isSupabase ? "☁ Supabase" : "💾 Local"}
        </span>

        <button
          onClick={onExport}
          title="Экспорт tasks.json"
          style={{ background: "rgba(255,255,255,0.12)", border: "none", borderRadius: 8, padding: "6px 10px", color: "#fff", fontSize: 12, cursor: "pointer", fontWeight: 500 }}
        >
          ↓ Экспорт
        </button>

        <button
          onClick={onImport}
          title="Импорт JSON"
          style={{ background: "#7C3AED", border: "none", borderRadius: 8, padding: "6px 12px", color: "#fff", fontSize: 12, cursor: "pointer", fontWeight: 600 }}
        >
          + Импорт
        </button>
      </div>
    </div>
  );
}
