import TaskCard        from "../shared/TaskCard";
import { formatWeekRange, isCycleWeek } from "../../lib/weekUtils";

export default function WeekBlock({ weekId, tasks, onToggle, onNavigate }) {
  const isCycle = isCycleWeek(weekId);
  const done    = tasks.filter(t => t.done).length;
  const total   = tasks.length;
  const pct     = total ? Math.round((done / total) * 100) : 0;
  const allDone = total > 0 && done === total;

  return (
    <div
      style={{
        background:   isCycle ? "#FEF2F2" : "#fff",
        border:       isCycle ? "1px solid #FECACA" : "1px solid #E2E8F0",
        borderRadius: 12,
        padding:      "12px 14px",
        marginBottom: 8,
        opacity:      allDone ? 0.7 : 1,
      }}
    >
      {/* Заголовок недели */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <button
          onClick={() => onNavigate(weekId)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left" }}
        >
          <span style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", fontFamily: "monospace" }}>
            {weekId}
          </span>
          <span style={{ fontSize: 12, color: "#64748B", marginLeft: 6 }}>
            {formatWeekRange(weekId)}
          </span>
        </button>

        {isCycle && (
          <span style={{ fontSize: 10, background: "#FEE2E2", color: "#DC2626", borderRadius: 20, padding: "1px 7px", fontWeight: 600 }}>
            🌀 цикл
          </span>
        )}

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          {/* Мини прогресс-бар */}
          {total > 0 && (
            <>
              <div style={{ width: 60, height: 3, background: "#E2E8F0", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ height: "100%", background: allDone ? "#059669" : "#7C3AED", width: `${pct}%`, borderRadius: 3 }} />
              </div>
              <span style={{ fontSize: 11, color: allDone ? "#059669" : "#94A3B8", fontWeight: 500 }}>
                {done}/{total}
              </span>
            </>
          )}
          {total === 0 && (
            <span style={{ fontSize: 11, color: "#CBD5E1" }}>нет задач</span>
          )}
        </div>
      </div>

      {/* Задачи */}
      {tasks.map(t => (
        <TaskCard key={t.id} task={t} onToggle={onToggle} compact />
      ))}
    </div>
  );
}
