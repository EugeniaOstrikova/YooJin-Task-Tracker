import { useState } from "react";
import { useHabits } from "../../hooks/useHabits";
import { getWeekDays } from "../../lib/weekUtils";

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
    <div style={{ marginTop: 24 }}>
      {/* Заголовок */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#4A7A85", textTransform: "uppercase", marginLeft: 4, letterSpacing: "0.06em" }}>
          Привычки
        </span>
        <button
          onClick={() => setAdding(v => !v)}
          style={{ background: "none", border: "1px solid #E2E8F0", borderRadius: 8, padding: "3px 10px", fontSize: 12, color: "#64748B", cursor: "pointer" }}
        >
          {adding ? "Отмена" : "+ Добавить"}
        </button>
      </div>

      {/* Добавление */}
      {adding && (
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <input
            autoFocus
            value={newText}
            onChange={e => setNewText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAdd()}
            placeholder="Название привычки..."
            style={{ flex: 1, padding: "7px 12px", borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 13, outline: "none" }}
          />
          <button
            onClick={handleAdd}
            style={{ background: "#0F172A", color: "#fff", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 13, cursor: "pointer" }}
          >
            OK
          </button>
        </div>
      )}

      {/* Таблица привычек */}
      {habits.length === 0 && !adding && (
        <div style={{ fontSize: 13, color: "#CBD5E1", fontStyle: "italic" }}>Нет привычек</div>
      )}

      {habits.length > 0 && (
        <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, overflow: "hidden", maxWidth: 520 }}>
          {/* Заголовок дней */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr repeat(7, 36px)", gap: 4, padding: "8px 12px", borderBottom: "1px solid #F1F5F9", background: "#F8FAFC" }}>
            <div />
            {days.map(d => (
              <div key={d.iso} style={{ textAlign: "center", fontSize: 10, fontWeight: 600, color: d.isToday ? "#0369A1" : "#94A3B8", textTransform: "uppercase" }}>
                {d.dayName}
              </div>
            ))}
          </div>

          {/* Строки привычек */}
          {habits.map((habit, hi) => {
            const dayLogs = logs[habit.id] ?? Array(7).fill(false);
            const doneCount = dayLogs.filter(Boolean).length;
            return (
              <div
                key={habit.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr repeat(7, 36px)",
                  gap: 4,
                  padding: "8px 12px",
                  alignItems: "center",
                  borderBottom: hi < habits.length - 1 ? "1px solid #F1F5F9" : "none",
                }}
              >
                {/* Название */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {habit.text}
                  </span>
                  <span style={{ fontSize: 10, color: "#94A3B8", flexShrink: 0 }}>{doneCount}/7</span>
                  <button
                    onClick={() => removeHabit(habit.id)}
                    style={{ background: "none", border: "none", color: "#CBD5E1", cursor: "pointer", fontSize: 12, padding: 0, flexShrink: 0, marginLeft: "auto" }}
                    title="Удалить привычку"
                  >
                    ✕
                  </button>
                </div>

                {/* Чекбоксы по дням */}
                {dayLogs.map((checked, di) => (
                  <div
                    key={di}
                    onClick={() => toggleDay(habit.id, di)}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      margin: "0 auto",
                      cursor: "pointer",
                      background: checked ? "#76A5AF" : "#F1F5F9",
                      border: days[di]?.isToday ? "1.5px solid #4A7A85" : "1.5px solid transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "background 0.15s",
                    }}
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