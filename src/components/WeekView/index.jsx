import { useState } from "react";
import DayColumn from "./DayColumn";
import TaskCard  from "../shared/TaskCard";
import {
  getWeekDays, formatWeekRange, formatWeekTitle,
  getNextWeekId, getPrevWeekId, getCurrentWeekId,
  isCycleWeek, formatDuration,
} from "../../lib/weekUtils";
import { getTrimesterForWeek } from "../../config/trimesters";
import HabitTracker from "./HabitTracker";
import WeekGoals from "./WeekGoals";

export default function WeekView({ weekId, onWeekChange, tasks, onToggle }) {
  const [unscheduledOpen, setUnscheduledOpen] = useState(true);

  const days     = getWeekDays(weekId);
  const isCycle  = isCycleWeek(weekId);
  const trimester = getTrimesterForWeek(weekId);
  const isCurrentWeek = weekId === getCurrentWeekId();

  // Задачи этой недели
  const weekTasks = tasks.filter(t => t.week === weekId);

  // Разбить по дням
  const tasksByDay = {};
  days.forEach(d => { tasksByDay[d.iso] = []; });
  const unscheduled = [];

  weekTasks.forEach(t => {
    if (t.day && tasksByDay[t.day]) tasksByDay[t.day].push(t);
    else unscheduled.push(t);
  });

  const done  = weekTasks.filter(t => t.done).length;
  const total = weekTasks.length;
  const pct   = total ? Math.round((done / total) * 100) : 0;
  const totalWeekHours = weekTasks.reduce((sum, t) => sum + (t.duration ?? 0), 0);
  const weekDurationLabel = formatDuration(totalWeekHours);

  return (
    <div style={{ padding: "16px 16px 40px", maxWidth: 1400, margin: "0 auto" }}>

      {/* ── Навигация по неделям ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <button onClick={() => onWeekChange(getPrevWeekId(weekId))} style={navBtn}>←</button>

        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 16, fontWeight: 600, color: "#0F172A" }}>
              {weekId}
            </span>
            <span style={{ fontSize: 14, color: "#64748B" }}>
              {formatWeekRange(weekId)}
            </span>
            {isCycle && (
              <span style={{ fontSize: 11, background: "#FAE8E5", color: "#C0614F", borderRadius: 20, padding: "2px 9px", fontWeight: 600 }}>
                🌀 Цикл
              </span>
            )}
            {trimester && (
              <span style={{ fontSize: 11, color: "#94A3B8" }}>
                {trimester.short}
              </span>
            )}
          </div>
          {/* Прогресс недели */}
          <div style={{ marginTop: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: "#94A3B8" }}>{weekDurationLabel ? `총 ${weekDurationLabel}` : ""}</span>
              <span style={{ fontSize: 12, color: pct === 100 ? "#059669" : "#94A3B8" }}>{done}/{total} · {pct}%</span>
            </div>
            <div style={{ height: 4, background: "#E2E8F0", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 4, background: pct === 100 ? "#059669" : "#76A5AF", width: `${pct}%`, transition: "width 0.3s" }} />
            </div>
          </div>
        </div>

        {!isCurrentWeek && (
          <button onClick={() => onWeekChange(getCurrentWeekId())} style={{ ...navBtn, fontSize: 11, padding: "6px 10px", background: "#F1F5F9", color: "#64748B" }}>
            Сегодня
          </button>
        )}
        <button onClick={() => onWeekChange(getNextWeekId(weekId))} style={navBtn}>→</button>
      </div>

      {/* ── Цикл предупреждение ── */}
      {isCycle && (
        <div style={{ background: "#FAE8E5", border: "1px solid #EDBIА8", borderRadius: 10, padding: "8px 14px", marginBottom: 14, fontSize: 13, color: "#C0614F" }}>
          🌀 Неделя цикла — возможно низкий уровень энергии. Планируй задачи с запасом.
        </div>
      )}

      <WeekGoals weekId={weekId} />

      {/* ── Основной layout: 2 колонки ── */}
      <div style={{ display: "flex", gap: 0 }}>

        {/* Левая колонка — Без дня */}
        <div style={{
          flex: "0 0 260px",
          minWidth: 240,
          paddingRight: 16,
          marginRight: 16,
          borderRight: "2px solid #76A5AF",
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#4A7A85", marginBottom: 8, marginLeft: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Без дня
          </div>
          {unscheduled.length === 0 ? (
            <div style={{ fontSize: 12, color: "#CBD5E1", textAlign: "center", marginTop: 16, fontStyle: "italic" }}>—</div>
          ) : (
            unscheduled.map(t => <TaskCard key={t.id} task={t} onToggle={onToggle} />)
          )}
        </div>

        {/* Правая колонка — дни */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Вс–Ср */}
          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            {days.slice(0, 4).map(day => (
              <DayColumn key={day.iso} day={day} tasks={tasksByDay[day.iso] || []} onToggle={onToggle} />
            ))}
          </div>
          {/* Чт–Сб */}
          <div style={{ display: "flex", gap: 10 }}>
            {days.slice(4).map(day => (
              <DayColumn key={day.iso} day={day} tasks={tasksByDay[day.iso] || []} onToggle={onToggle} />
            ))}
          </div>
        </div>

      </div>

      {total === 0 && (
        <div style={{ textAlign: "center", color: "#CBD5E1", fontSize: 14, marginTop: 48 }}>
          На эту неделю задач нет.<br />
          <span style={{ fontSize: 12 }}>Добавь их через кнопку «Импорт» ↑</span>
        </div>
      )}
      <HabitTracker weekId={weekId} />
    </div>
  );
}

const navBtn = {
  background:   "#fff",
  border:       "1px solid #E2E8F0",
  borderRadius: 8,
  padding:      "6px 12px",
  cursor:       "pointer",
  fontSize:     16,
  color:        "#0F172A",
  flexShrink:   0,
};
