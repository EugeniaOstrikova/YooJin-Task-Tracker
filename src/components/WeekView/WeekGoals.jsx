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
    <div className="week-goals">
      <h3 className="week-goals__title">Главное на неделю</h3>

      <div className="week-goals__list">
        {goals.map((goal, i) => (
          <div key={i} className="goal-row">

            <div
              onClick={() => goal && toggleDone(i)}
              className={`goal-cb${done[i] ? " goal-cb--done" : ""}`}
              style={{ cursor: goal ? "pointer" : "default" }}
            >
              {done[i] && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>

            <span className="goal-num">{i + 1}.</span>

            {editingIndex === i ? (
              <input
                autoFocus
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onBlur={() => commitEdit(i)}
                onKeyDown={e => {
                  if (e.key === "Enter")  commitEdit(i);
                  if (e.key === "Escape") setEditingIndex(null);
                }}
                placeholder={`Цель ${i + 1}...`}
                className="goal-input"
              />
            ) : (
              <div
                onClick={() => startEdit(i)}
                className={`goal-text${done[i] ? " goal-text--done" : goal ? " goal-text--filled" : " goal-text--empty"}`}
                onMouseEnter={e => e.currentTarget.style.borderColor = "var(--c-teal-bd)"}
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
