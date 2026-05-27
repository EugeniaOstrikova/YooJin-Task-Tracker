import { useCategories } from "../../context/CategoriesContext";
import { getCatCardStyle } from "../../lib/categoryStyles";
import { Calendar } from "lucide-react";

const STATUS_COLORS = {
  "Idea":        { color: "var(--c-dim)",    bg: "#F8FAFC" },
  "Planning":    { color: "var(--c-mid)",    bg: "#F1F5F9" },
  "In Progress": { color: "var(--c-accent)", bg: "var(--c-teal-bg)" },
  "On Hold":     { color: "var(--c-late)",   bg: "var(--c-late-bg)" },
  "Completed":   { color: "var(--c-ok)",     bg: "var(--c-ok-bg)" },
  "Cancelled":   { color: "var(--c-missed)", bg: "var(--c-missed-bg)" },
};

export default function GoalCard({ goal, taskCount, doneCount, onClick }) {
  const { cats }  = useCategories();
  const catStyle  = cats[goal.cat];
  const pct       = taskCount ? Math.round(doneCount / taskCount * 100) : 0;
  const statusStyle = STATUS_COLORS[goal.status] ?? STATUS_COLORS["Planning"];

  return (
    <div
      className="card"
      onClick={onClick}
      style={{
        cursor: "pointer",
        borderRight: catStyle ? `3px solid ${catStyle.dot}` : undefined,
        transition: "box-shadow 0.15s",
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.08)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
    >
      {/* Заголовок + статус */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: "var(--c-ink)", lineHeight: 1.3 }}>
          {goal.title}
        </span>
        <span className="badge" style={{
          background: statusStyle.bg,
          color:      statusStyle.color,
          flexShrink: 0,
        }}>
          {goal.status}
        </span>
      </div>

      {/* Категория */}
      {catStyle && (
        <span style={{
          fontSize: 11, color: catStyle.text,
          background: catStyle.bg, borderRadius: "var(--r-pill)",
          padding: "1px 8px", display: "inline-block", marginBottom: 10,
        }}>
          {catStyle.label}
        </span>
      )}

      {/* Прогресс */}
      {taskCount > 0 && (
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: "var(--c-dim)" }}>Progress</span>
            <span style={{ fontSize: 11, color: "var(--c-mid)", fontWeight: 600 }}>
              {doneCount}/{taskCount} · {pct}%
            </span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}

      {/* Дедлайн */}
      {goal.deadline && (
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 8 }}>
          <Calendar size={11} color="var(--c-dim)" />
          <span style={{ fontSize: 11, color: "var(--c-dim)" }}>
            {new Date(goal.deadline).toLocaleDateString("ru", { day: "numeric", month: "short", year: "numeric" })}
          </span>
        </div>
      )}
    </div>
  );
}