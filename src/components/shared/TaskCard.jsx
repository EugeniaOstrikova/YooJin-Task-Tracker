import PriorityIcon from "./PriorityIcon";
import CategoryTag  from "./CategoryTag";
import { CATS } from "../../config/categories";

/**
 * Карточка задачи.
 * compact=true — для триместр-вью (меньше отступы)
 */
export default function TaskCard({ task, onToggle, compact = false }) {
  const { text, cat, done, important = false, urgent = false, deadline = false } = task;
  const catStyle = CATS[cat] ?? CATS.music;

  return (
    <div
      onClick={() => onToggle(task.id)}
      style={{
        display:       "flex",
        alignItems:    "flex-start",
        gap:           8,
        padding:       compact ? "6px 8px" : "8px 10px",
        borderRadius:  8,
        marginBottom:  3,
        cursor:        "pointer",
        background: done ? catStyle.bg + "66" : catStyle.bg,
        border:     deadline && !done ? `1px solid ${catStyle.dot}` : "0.5px solid transparent",
        userSelect:    "none",
        transition:    "opacity 0.15s",
        opacity:       done ? 0.55 : 1,
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
          background:     done ? "#0F172A" : "transparent",
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
