import PriorityIcon from "./PriorityIcon";
import CategoryTag  from "./CategoryTag";
import { useCategories } from "../../context/CategoriesContext";
import { formatDuration } from "../../lib/weekUtils";

export default function TaskCard({ task, onToggle, compact = false }) {
  const { cats } = useCategories();
  const { text, cat, done, important = false, urgent = false, deadline = false } = task;
  const catStyle = cats[task.cat] ?? { bg: "#F1F5F9", text: "#64748B", dot: "#94A3B8" };
  const durationLabel = formatDuration(task.duration);

  return (
    <div
      onClick={() => onToggle(task.id)}
      className={`task-card${compact ? " task-card--compact" : ""}${done ? " task-card--done" : ""}`}
      style={{
        background:  cat === "other" ? "transparent" : `linear-gradient(to left, ${catStyle.bg}, transparent)`,
        borderRight: cat === "other" ? "none" : `3px solid ${catStyle.dot}`,
      }}
    >
      {/* Чекбокс */}
      <div
        className={`task-card__cb${done ? " task-card__cb--done" : ""}`}
        style={{ background: done ? catStyle.dot : "transparent" }}
      >
        {done && (
          <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
            <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      {/* Контент */}
      <div className="task-card__body">
        <div className="task-card__row">
          <PriorityIcon important={important} urgent={urgent} size={12} />
          <span className={`task-card__text${compact ? " task-card__text--compact" : ""}${done ? " task-card__text--done" : ""}`}>
            {text}
          </span>
          {durationLabel && (
            <span className="task-card__dur">{durationLabel}</span>
          )}
        </div>

        {deadline && !done && (
          <div className="task-card__tags">
            <span className="badge badge--deadline">ДЕДЛАЙН</span>
          </div>
        )}
      </div>
    </div>
  );
}
