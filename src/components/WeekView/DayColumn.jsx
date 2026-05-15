import TaskCard from "../shared/TaskCard";
import { formatDuration } from "../../lib/weekUtils";

export default function DayColumn({ day, tasks, onToggle }) {
  const { shortLabel, isToday } = day;
  const totalHours = tasks.reduce((sum, t) => sum + (t.duration ?? 0), 0);
  const totalLabel = formatDuration(totalHours);

  return (
    <div
      style={{
        flex: "0 0 260px",
        minWidth: 240,
        background: isToday ? "#EAF3F5" : "#fff",
        border:     isToday ? "1px solid #B8D6DC" : "1px solid #E2E8F0",
        borderRadius:  12,
        padding:       "10px 10px 12px",
        display:       "flex",
        flexDirection: "column",
        gap:           2,
      }}
    >
      {/* Заголовок дня */}
      <div
        style={{
          fontSize:     12,
          fontWeight:   600,
          color: isToday ? "#4A7A85" : "#64748B",
          marginBottom: 8,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          display:       "flex",
          alignItems:    "center",
          gap:           6,
        }}
      >
        {shortLabel}
        {isToday && (
          <span style={{ background: "#76A5AF", color: "#fff", borderRadius: 20, fontSize: 9, padding: "1px 6px", fontWeight: 700 }}>
            сегодня
          </span>
        )}
      </div>

      {/* Задачи */}
      {tasks.length === 0 ? (
        <div style={{ fontSize: 12, color: "#CBD5E1", textAlign: "center", marginTop: 16, fontStyle: "italic" }}>
          —
        </div>
      ) : (
        tasks.map(t => (
          <TaskCard key={t.id} task={t} onToggle={onToggle} />
        ))
      )}

      {totalLabel && (
        <div style={{ marginTop: 8, paddingTop: 6, borderTop: "1px solid #F1F5F9", fontSize: 11, color: "#94A3B8", textAlign: "right" }}>
          총 {totalLabel}
        </div>
      )}

    </div>
  );
}
