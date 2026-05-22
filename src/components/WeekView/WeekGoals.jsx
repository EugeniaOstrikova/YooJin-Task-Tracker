import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useWeekGoals } from "../../hooks/useWeekGoals";
import Checkbox from "@mui/material/Checkbox";

export default function WeekGoals({ weekId }) {
  const { goals, done, updateGoal, toggleDone } = useWeekGoals(weekId);
  const [editingIndex, setEditingIndex] = useState(null);
  const [draft, setDraft] = useState("");
  const { t } = useTranslation();

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
      <h3 className="week-goals__title">{t("weekGoals.title")}</h3>

      <div className="week-goals__list">
        {goals.map((goal, i) => (
          <div key={i} className="goal-row">
            <Checkbox
              className="goal-cb"
              checked={done[i]}
              onClick={() => goal && toggleDone(i)} 
              size="small"
            />

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
                placeholder={t("weekGoals.goalPlaceholder", { num: i + 1 })}
                className="goal-input"
              />
            ) : (
              <div
                onClick={() => startEdit(i)}
                className={`goal-text${done[i] ? " goal-text--done" : goal ? " goal-text--filled" : " goal-text--empty"}`}
              >
                {goal || t("weekGoals.goalPlaceholder", { num: i + 1 })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
