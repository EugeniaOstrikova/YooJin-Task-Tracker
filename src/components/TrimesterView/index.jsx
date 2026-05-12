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

  // Сгруппировать недели по месяцу (для визуального разделения)
  const grouped = [];
  let currentMonth = null;
  weeks.forEach(wId => {
    const monthLabel = getMonthLabel(wId);
    if (monthLabel !== currentMonth) {
      currentMonth = monthLabel;
      grouped.push({ month: monthLabel, weeks: [] });
    }
    grouped[grouped.length - 1].weeks.push(wId);
  });

  return (
    <div style={{ padding: "16px 16px 40px", maxWidth: 900, margin: "0 auto" }}>

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
              border:       selectedId === t.id ? "1.5px solid #7C3AED" : "1px solid #E2E8F0",
              background:   selectedId === t.id ? "#EDE9FE" : "#fff",
              color:        selectedId === t.id ? "#5B21B6" : "#64748B",
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
      <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, padding: "12px 16px", marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{trimester.label}</span>
          <span style={{ fontSize: 12, color: trimPct === 100 ? "#059669" : "#94A3B8", fontWeight: 500 }}>
            {trimDone}/{trimTotal} задач · {trimPct}%
          </span>
        </div>
        <div style={{ height: 6, background: "#E2E8F0", borderRadius: 4, overflow: "hidden" }}>
          <div style={{ height: "100%", background: trimPct === 100 ? "#059669" : "#7C3AED", width: `${trimPct}%`, borderRadius: 4, transition: "width 0.4s" }} />
        </div>
      </div>

      {/* ── Недели сгруппированные по месяцам ── */}
      {grouped.map(group => (
        <div key={group.month} style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
            {group.month}
          </div>
          {group.weeks.map(wId => (
            <WeekBlock
              key={wId}
              weekId={wId}
              tasks={tasks.filter(t => t.week === wId)}
              onToggle={onToggle}
              onNavigate={id => onNavigateWeek(id)}
            />
          ))}
        </div>
      ))}

      {trimTotal === 0 && (
        <div style={{ textAlign: "center", color: "#CBD5E1", fontSize: 14, marginTop: 48 }}>
          В этом триместре задач нет.<br />
          <span style={{ fontSize: 12 }}>Добавь через «Импорт» ↑</span>
        </div>
      )}
    </div>
  );
}
