import PriorityIcon from "./PriorityIcon";
import CategoryTag  from "./CategoryTag";
import { CATS } from "../../config/categories";
import { formatDuration } from "../../lib/weekUtils";

/**
 * Карточка задачи.
 * compact=true — для триместр-вью (меньше отступы)
 */
export default function TaskCard({ task, onToggle, compact = false }) {
  const { text, cat, done, important = false, urgent = false, deadline = false } = task;
  const catStyle = CATS[cat] ?? CATS.music;
  const durationLabel = formatDuration(task.duration);

  return (
    <div
      onClick={() => onToggle(task.id)}
      style={{
      display:       "flex",
      alignItems:    "flex-start",
      gap:           8,
      padding:       compact ? "5px 10px 5px 6px" : "7px 10px 7px 6px",
      borderRadius:  6,
      marginBottom:  2,
      cursor:        "pointer",
      background:  cat === "other" ? "transparent" : `linear-gradient(to left, ${catStyle.bg}, transparent)`,
      borderRight: cat === "other" ? "none" : `3px solid ${catStyle.dot}`,
      userSelect:    "none",
      opacity:       done ? 0.45 : 1,
      transition:    "opacity 0.15s",
    }}
    >
      {/* Чекбокс */}
      <div
        style={{
          width:          16,
          height:         16,
          borderRadius:   4,
          flexShrink:     0,
          marginTop:      2,
          border:         done ? "none" : "1.5px solid #0F172A",
          background:     done ? catStyle.dot : "transparent",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          transition:     "background 0.15s",
        }}
      >
        {done && (
          <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
            <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      {/* Контент */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display:        "flex",
            alignItems:     "flex-start",
            gap:            5,
            flexWrap:       "wrap",
          }}
        >
          {/* Приоритет */}
          <PriorityIcon important={important} urgent={urgent} size={12} />

          {/* Текст */}
          <span
            style={{
              fontSize:       compact ? 12 : 13,
              fontWeight:     500,
              color:          done ? "#94A3B8" : "#0F172A",
              textDecoration: done ? "line-through" : "none",
              lineHeight:     1.4,
              flex:           1,
            }}
          >
            {text}
          </span>
          {durationLabel && (
            <span style={{ fontSize: 11, color: "#94A3B8", whiteSpace: "nowrap", flexShrink: 0 }}>
              {durationLabel}
            </span>
          )}
        </div>

        {/* Теги */}
        {deadline && !done && (
          <div style={{ marginTop: 4 }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: "#DC2626", background: "#FEE2E2", borderRadius: 20, padding: "1px 7px", letterSpacing: "0.04em" }}>
              ДЕДЛАЙН
            </span>
          </div>
        )}
   
      </div>
    </div>
  );
}
