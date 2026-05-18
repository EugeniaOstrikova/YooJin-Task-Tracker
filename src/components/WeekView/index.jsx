import { useState, useEffect } from "react";
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
import { useCalendar } from "../../hooks/useCalendar";

export default function WeekView({ weekId, onWeekChange, tasks, onToggle, onUpdateTask }) {
  const [unscheduledOpen, setUnscheduledOpen] = useState(true);

  const days        = getWeekDays(weekId);
  const isCycle     = isCycleWeek(weekId);
  const trimester   = getTrimesterForWeek(weekId);
  const isCurrentWeek = weekId === getCurrentWeekId();

  const weekTasks = tasks.filter(t => t.week === weekId);

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
  const totalWeekHours    = weekTasks.reduce((sum, t) => sum + (t.duration ?? 0), 0);
  const weekDurationLabel = formatDuration(totalWeekHours);

  const { getWeekEvents } = useCalendar();
  const [calEvents, setCalEvents] = useState([]);

  useEffect(() => {
    getWeekEvents(weekId).then(setCalEvents).catch(console.error);
  }, [weekId, getWeekEvents]);

  return (
    <div className="week-view">

      {/* ── Навигация по неделям ── */}
      <div className="week-nav">
        <button onClick={() => onWeekChange(getPrevWeekId(weekId))} className="btn-nav">←</button>

        <div className="week-nav__info">
          <div className="week-nav__heading">
            <span className="week-nav__id">{weekId}</span>
            <span className="week-nav__range">{formatWeekRange(weekId)}</span>
            {isCycle && <span className="badge badge--cycle">🌀 Цикл</span>}
            {trimester && <span className="week-nav__tri">{trimester.short}</span>}
          </div>

          <div className="week-nav__progress">
            <div className="week-nav__progress-row">
              <span className="week-nav__meta">{weekDurationLabel ? `총 ${weekDurationLabel}` : ""}</span>
              <span className={`week-nav__meta${pct === 100 ? " week-nav__meta--done" : ""}`}>
                {done}/{total} · {pct}%
              </span>
            </div>
            <div className="progress-track">
              <div
                className={`progress-fill${pct === 100 ? " progress-fill--done" : ""}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>

        {!isCurrentWeek && (
          <button onClick={() => onWeekChange(getCurrentWeekId())} className="btn-nav-today">
            Сегодня
          </button>
        )}
        <button onClick={() => onWeekChange(getNextWeekId(weekId))} className="btn-nav">→</button>
      </div>

      {/* ── Предупреждение цикла ── */}
      {isCycle && (
        <div className="cycle-warning">
          🌀 Неделя цикла — возможно низкий уровень энергии. Планируй задачи с запасом.
        </div>
      )}

      <div className="week-meta-row">
        <div className="week-meta-row__content">
          <WeekGoals weekId={weekId} />
        </div>
        <div className="week-meta-row__content">
          <HabitTracker weekId={weekId} />
        </div>
      </div>

      {/* <WeekGoals weekId={weekId} /> */}

      {/* ── Основной layout ── */}
      <div className="week-layout">

        {/* Левая колонка — Без дня */}
        <div className="week-layout__left">
          <div className="week-layout__left-title">Без дня</div>
          {unscheduled.length === 0
            ? <div className="empty">—</div>
            : unscheduled.map(t => <TaskCard key={t.id} task={t} onToggle={onToggle} />)
          }
        </div>

        {/* Правая колонка — дни */}
        <div className="week-layout__right">
          <div className="days-row">
            {days.slice(0, 4).map(day => (
              <DayColumn key={day.iso} day={day} tasks={tasksByDay[day.iso] || []} 
                onToggle={onToggle} calEvents={calEvents.filter(e => e.date === day.iso)}
                onUpdateTask={onUpdateTask} />
            ))}
          </div>
          <div className="days-row">
            {days.slice(4).map(day => (
              <DayColumn key={day.iso} day={day} tasks={tasksByDay[day.iso] || []} 
                onToggle={onToggle} calEvents={calEvents.filter(e => e.date === day.iso)} />
            ))}
          </div>
        </div>

      </div>

      {total === 0 && (
        <div className="empty empty--lg">
          На эту неделю задач нет.<br />
          <span style={{ fontSize: 12 }}>Добавь их через кнопку «Импорт» ↑</span>
        </div>
      )}

      {/* <HabitTracker weekId={weekId} /> */}
    </div>
  );
}
