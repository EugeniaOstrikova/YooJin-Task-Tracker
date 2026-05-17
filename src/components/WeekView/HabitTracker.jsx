import { useState } from "react";
import { useHabits } from "../../hooks/useHabits";
import { getWeekDays } from "../../lib/weekUtils";
import { Settings2 } from 'lucide-react';

export default function HabitTracker({ weekId }) {
  const { habits, logs, loading, toggleDay, createHabit, removeHabit } = useHabits(weekId);
  const days = getWeekDays(weekId);
  const [newText, setNewText] = useState("");
  const [adding,  setAdding]  = useState(false);

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
        <h3 className="habit-head__title">Привычки</h3>
        <Settings2 onClick={() => setAdding(v => !v)} size={14} className="btn-habit-edit" />
      </div>

      {adding && (
        <div className="habit-add-row">
          <input
            autoFocus
            value={newText}
            onChange={e => setNewText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAdd()}
            placeholder="Название привычки..."
            className="input"
          />
          <button onClick={handleAdd} className="btn-ok">OK</button>
        </div>
      )}

      {habits.length === 0 && !adding && (
        <div className="empty">Нет привычек</div>
      )}

      {habits.length > 0 && (
        <div className="habit-table">
          <div className="habit-table__header">
            <div />
            {days.map(d => (
              <div
                key={d.iso}
                className={`habit-table__day${d.isToday ? " habit-table__day--today" : ""}`}
              >
                {d.dayName}
              </div>
            ))}
          </div>

          {habits.map((habit, hi) => {
            const dayLogs  = logs[habit.id] ?? Array(7).fill(false);
            const doneCount = dayLogs.filter(Boolean).length;
            return (
              <div key={habit.id} className="habit-row">
                <div className="habit-row__name">
                  <span className="habit-row__text">{habit.text}</span>
                  <span className="habit-row__count">{doneCount}/7</span>
                  <button
                    onClick={() => removeHabit(habit.id)}
                    className="habit-row__del"
                    title="Удалить привычку"
                  >
                    ✕
                  </button>
                </div>

                {dayLogs.map((checked, di) => (
                  <div
                    key={di}
                    onClick={() => toggleDay(habit.id, di)}
                    className={`habit-cell${checked ? " habit-cell--on" : ""}${days[di]?.isToday ? " habit-cell--today" : ""}`}
                  >
                    {checked && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
