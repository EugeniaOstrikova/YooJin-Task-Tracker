import { useState } from "react";
import { useWeekGoals } from "../../hooks/useWeekGoals";

export default function WeekGoals({ weekId }) {
  const { goals, done, updateGoal, toggleDone } = useWeekGoals(weekId);
  const [editingIndex, setEditingIndex] = useState(null);
  const [draft, setDraft] = useState("");

  function startEdit(i) {
    setEditingIndex(i);
    setDraft(goals[i]);
  }

  function commitEdit(i) {
    updateGoal(i, draft);
    setEditingIndex(null);
  }

  return (
    <div style={{
      background: "#EAF3F5",
      border: "1px solid #B8D6DC",
      borderRadius: 12,
      padding: "12px 16px",
      marginBottom: 16,
    }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#4A7A85", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
        Главное на неделю
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {goals.map((goal, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>

            {/* Чекбокс */}
            <div
              onClick={() => goal && toggleDone(i)}
              style={{
                width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                border: done[i] ? "none" : "1.5px solid #76A5AF",
                background: done[i] ? "#76A5AF" : "transparent",
                cursor: goal ? "pointer" : "default",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background 0.15s",
              }}
            >
              {done[i] && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>

            {/* Номер */}
            <span style={{ fontSize: 13, fontWeight: 700, color: "#4A7A85", flexShrink: 0 }}>
              {i + 1}.
            </span>

            {/* Текст / инпут */}
            {editingIndex === i ? (
              <input
                autoFocus
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onBlur={() => commitEdit(i)}
                onKeyDown={e => {
                  if (e.key === "Enter") commitEdit(i);
                  if (e.key === "Escape") setEditingIndex(null);
                }}
                placeholder={`Цель ${i + 1}...`}
                style={{
                  flex: 1,
                  background: "#fff",
                  border: "1px solid #A5B4FC",
                  borderRadius: 8,
                  padding: "5px 10px",
                  fontSize: 13,
                  color: "#1E293B",
                  outline: "none",
                }}
              />
            ) : (
              <div
                onClick={() => startEdit(i)}
                style={{
                  flex: 1,
                  padding: "5px 10px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: goal ? 500 : 400,
                  color: done[i] ? "#94A3B8" : goal ? "#1E293B" : "#9BBFC6",
                  textDecoration: done[i] ? "line-through" : "none",
                  cursor: "text",
                  border: "1px solid transparent",
                  transition: "border 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "#B8D6DC"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "transparent"}
              >
                {goal || `Цель ${i + 1}...`}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}