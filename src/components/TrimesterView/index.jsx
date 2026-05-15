import { useState } from "react";
import WeekBlock from "./WeekBlock";
import { TRIMESTERS, getTrimesterForWeek } from "../../config/trimesters";
import { getWeeksBetween, getCurrentWeekId, getMonthLabel } from "../../lib/weekUtils";

export default function TrimesterView({ tasks, onToggle, onNavigateWeek, currentWeekId }) {
  const currentTrimester = getTrimesterForWeek(currentWeekId) ?? TRIMESTERS[0];
  const [selectedId, setSelectedId] = useState(currentTrimester.id);

  const trimester = TRIMESTERS.find(t => t.id === selectedId) ?? TRIMESTERS[0];
  const weeks     = getWeeksBetween(trimester.start, trimester.end);

  // Прогресс триместра
  const trimTasks = tasks.filter(t => t.week >= trimester.start && t.week <= trimester.end);
  const trimDone  = trimTasks.filter(t => t.done).length;
  const trimTotal = trimTasks.length;
  const trimPct   = trimTotal ? Math.round((trimDone / trimTotal) * 100) : 0;

  return (
    <div style={{ padding: "16px 16px 40px" }}>

      {/* ── Переключатель триместров ── */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {TRIMESTERS.map(t => (
          <button
            key={t.id}
            onClick={() => setSelectedId(t.id)}
            style={{
              padding:      "6px 14px",
              fontSize:     12,
              borderRadius: 20,
              border:     selectedId === t.id ? "1.5px solid #76A5AF" : "1px solid #E2E8F0",
              background: selectedId === t.id ? "#EAF3F5" : "#fff",
              color:      selectedId === t.id ? "#4A7A85" : "#64748B",
              fontWeight:   selectedId === t.id ? 600 : 400,
              cursor:       "pointer",
              transition:   "all 0.15s",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Прогресс триместра ── */}
      <div style={{ padding: "0 8px", marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: "#0F172A" }}>{trimester.label}</span>
          <span style={{ fontSize: 12, color: trimPct === 100 ? "#059669" : "#94A3B8", fontWeight: 500 }}>
            {trimDone}/{trimTotal} · {trimPct}%
          </span>
        </div>
        <div style={{ height: 6, background: "#E2E8F0", borderRadius: 4, overflow: "hidden" }}>
          <div style={{ height: "100%", background: trimPct === 100 ? "#059669" : "#76A5AF", width: `${trimPct}%`, borderRadius: 4, transition: "width 0.4s" }} />
        </div>
      </div>

      {/* ── Недели сгруппированные по месяцам ── */}
      {/* ── Недели сеткой 4 колонки ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 10,
      }}>
        {weeks.map(wId => (
          <WeekBlock
            key={wId}
            weekId={wId}
            tasks={tasks.filter(t => t.week === wId)}
            onToggle={onToggle}
            onNavigate={id => onNavigateWeek(id)}
          />
        ))}
      </div>

      {trimTotal === 0 && (
        <div style={{ textAlign: "center", color: "#CBD5E1", fontSize: 14, marginTop: 48 }}>
          В этом триместре задач нет.<br />
          <span style={{ fontSize: 12 }}>Добавь через «Импорт» ↑</span>
        </div>
      )}
    </div>
  );
}
