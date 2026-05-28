import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useHabits } from "../../hooks/useHabits";
import { getWeekDays } from "../../lib/weekUtils";
import { Settings2, X } from "lucide-react";
import Checkbox from "@mui/material/Checkbox";

export default function HabitTracker({ weekId }) {
  const { habits, logs, loading, toggleDay, createHabit, removeHabit } =
    useHabits(weekId);
  const { t, i18n } = useTranslation();
  const days = getWeekDays(weekId, i18n.language);
  const [newText, setNewText] = useState("");
  const [adding, setAdding] = useState(false);

  async function handleAdd() {
    if (!newText.trim()) return;
    await createHabit(newText.trim());
    setNewText("");
    setAdding(false);
  }

  if (loading) return null;

  return (
    <div className="habit-wrap">
      <div className="habit-head">
        <h3 className="habit-head__title">{t("habitTracker.title")}</h3>
        <button className="btn-icon-nav">
          <Settings2 onClick={() => setAdding((v) => !v)} size={14} />
        </button>
      </div>

      {adding && (
        <div className="habit-add-row">
          <input
            autoFocus
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder={t("habitTracker.placeholder")}
            className="input"
          />
          <button onClick={handleAdd} className="btn-ok">
            OK
          </button>
        </div>
      )}

      {habits.length === 0 && !adding && (
        <div className="empty">{t("habitTracker.empty")}</div>
      )}

      {habits.length > 0 && (
        <div className="habit-table">
          <div className="habit-table__header">
            <div />
            {days.map((d) => (
              <div
                key={d.iso}
                className={`habit-table__day${d.isToday ? " habit-table__day--today" : ""}`}
              >
                {d.dayName}
              </div>
            ))}
          </div>

          {habits.map((habit, hi) => {
            const dayLogs = logs[habit.id] ?? Array(7).fill(false);
            const doneCount = dayLogs.filter(Boolean).length;
            return (
              <div key={habit.id} className="habit-row">
                <div className="habit-row__name">
                  <span className="habit-row__text">{habit.text}</span>
                  <span className="habit-row__count">{doneCount}/7</span>
                  <button
                    onClick={() => removeHabit(habit.id)}
                    className="habit-row__del"
                    title={t("habitTracker.deleteTitle")}
                  >
                    <X size={12} />
                  </button>
                </div>

                {dayLogs.map((checked, di) => (
                  <Checkbox
                    key={di}
                    checked={checked}
                    onClick={() => toggleDay(habit.id, di)}
                    className={`habit-cell${days[di]?.isToday ? " habit-cell--today" : ""}`}
                  />
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
