import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import DayColumn from "./DayColumn";
import TaskCard from "../shared/TaskCard";
import {
  getWeekDays,
  formatWeekRange,
  getNextWeekId,
  getPrevWeekId,
  getCurrentWeekId,
  isCycleWeek,
  formatDuration,
} from "../../lib/weekUtils";
import { getTrimesterForWeek } from "../../config/trimesters";
import HabitTracker from "./HabitTracker";
import WeekGoals from "./WeekGoals";
import { useCalendar } from "../../hooks/useCalendar";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Plus, ArrowRight, ArrowLeft, BookOpen } from "lucide-react";
import TaskEditModal from "../shared/TaskEditModal";

export default function WeekView({
  weekId,
  onWeekChange,
  tasks,
  onToggle,
  onUpdateTask,
  onAddTask,
  currentChapter,
  onNavigateToChapter,
}) {
  const [creating, setCreating] = useState(null);
  const { t, i18n } = useTranslation();
  const locale = i18n.language;

  const days = getWeekDays(weekId, locale);
  const isCycle = isCycleWeek(weekId);
  const trimester = getTrimesterForWeek(weekId);
  const isCurrentWeek = weekId === getCurrentWeekId();

  const weekTasks = tasks.filter((t) => t.week === weekId);

  const tasksByDay = {};
  days.forEach((d) => {
    tasksByDay[d.iso] = [];
  });
  const unscheduled = [];
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );
  const [activeTask, setActiveTask] = useState(null);
  const [editingTask, setEditingTask] = useState(null);

  function handleDragStart({ active }) {
    const task = tasks.find((t) => t.id === active.id);
    setActiveTask(task ?? null);
  }

  function handleDragEnd({ active, over }) {
    setActiveTask(null);
    if (!over || active.id === over.id) return;
    const task = tasks.find((t) => t.id === active.id);
    const newDay = over.id;
    if (!task || task.day === newDay) return;
    onUpdateTask(task.id, { day: newDay });
  }

  weekTasks.forEach((t) => {
    if (t.day && tasksByDay[t.day]) tasksByDay[t.day].push(t);
    else unscheduled.push(t);
  });

  const done = weekTasks.filter((t) => t.done).length;
  const total = weekTasks.length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const totalWeekHours = weekTasks.reduce(
    (sum, t) => sum + (t.duration ?? 0),
    0
  );
  const weekDurationLabel = formatDuration(totalWeekHours, locale);

  const { getWeekEvents } = useCalendar();
  const [calEvents, setCalEvents] = useState([]);

  useEffect(() => {
    getWeekEvents(weekId).then(setCalEvents).catch(console.error);
  }, [weekId, getWeekEvents]);

  return (
    <div className="week-view">
      <div className="week-nav">
        <button
          onClick={() => onWeekChange(getPrevWeekId(weekId))}
          className="btn-nav"
        >
          <ArrowLeft size={16} />
        </button>

        <div className="week-nav__info">
          <div className="week-nav__heading">
            <span className="week-nav__id">{weekId}</span>
            <span className="week-nav__range">
              {formatWeekRange(weekId, locale)}
            </span>
            {isCycle && <span className="badge badge--cycle">🌀 Цикл</span>}
            {trimester && (
              <span className="week-nav__tri">{trimester.short}</span>
            )}
          </div>

          <div className="week-nav__progress">
            <div className="week-nav__progress-row">
              <span className="week-nav__meta">
                {weekDurationLabel
                  ? `${t("weekView.totalPrefix")} ${weekDurationLabel}`
                  : ""}
              </span>
              <span
                className={`week-nav__meta${pct === 100 ? " week-nav__meta--done" : ""}`}
              >
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

        {currentChapter && (
          <button
            className="btn-secondary"
            onClick={() => onNavigateToChapter(currentChapter)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
            }}
            title="Перейти к текущей главе"
          >
            <BookOpen size={14} />
            {currentChapter.title}
          </button>
        )}

        {!isCurrentWeek && (
          <button
            onClick={() => onWeekChange(getCurrentWeekId())}
            className="btn-nav-today"
          >
            {t("weekView.today")}
          </button>
        )}
        <button className="btn-nav" onClick={() => setCreating({ day: "" })}>
          <Plus size={16} />
        </button>
        <button
          onClick={() => onWeekChange(getNextWeekId(weekId))}
          className="btn-nav"
        >
          <ArrowRight size={16} />
        </button>
      </div>

      {isCycle && (
        <div className="cycle-warning">{t("weekView.cycleWarning")}</div>
      )}

      <div className="week-meta-row">
        <div className="week-meta-row__content">
          <WeekGoals weekId={weekId} />
        </div>
        <div className="week-meta-row__content">
          <HabitTracker weekId={weekId} />
        </div>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="week-layout">
          <div className="week-layout__left">
            <div className="week-layout__left-title">
              <span>{t("weekView.noDay")}</span>
              <button
                className="btn-icon-nav"
                onClick={() => setCreating({ day: "" })}
              >
                <Plus size={14} />
              </button>
            </div>
            {unscheduled.length === 0 ? (
              <div className="empty">—</div>
            ) : (
              unscheduled.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggle={onToggle}
                  onEdit={setEditingTask}
                  onSave={onUpdateTask}
                />
              ))
            )}
          </div>

          <div className="week-layout__right">
            <div className="days-row">
              {days.slice(0, 4).map((day) => (
                <DayColumn
                  key={day.iso}
                  day={day}
                  tasks={tasksByDay[day.iso] || []}
                  onToggle={onToggle}
                  calEvents={calEvents.filter((e) => e.date === day.iso)}
                  onUpdateTask={onUpdateTask}
                  onAddTask={onAddTask}
                  weekId={weekId}
                />
              ))}
            </div>
            <div className="days-row">
              {days.slice(4).map((day) => (
                <DayColumn
                  key={day.iso}
                  day={day}
                  tasks={tasksByDay[day.iso] || []}
                  onToggle={onToggle}
                  calEvents={calEvents.filter((e) => e.date === day.iso)}
                  onUpdateTask={onUpdateTask}
                  onAddTask={onAddTask}
                  weekId={weekId}
                />
              ))}
            </div>
          </div>
        </div>
        <DragOverlay>
          {activeTask && (
            <TaskCard
              task={activeTask}
              onToggle={() => {}}
              compact
              onSave={onUpdateTask}
            />
          )}
        </DragOverlay>
      </DndContext>

      {total === 0 && (
        <div className="empty empty--lg">
          {t("weekView.empty")}
          <br />
          <span style={{ fontSize: 12 }}>{t("weekView.emptyHint")}</span>
        </div>
      )}

      {creating !== null && (
        <TaskEditModal
          defaultDay={creating.day}
          weekId={weekId}
          onAdd={onAddTask}
          onClose={() => setCreating(null)}
        />
      )}

      {editingTask && (
        <TaskEditModal
          task={editingTask}
          onSave={onUpdateTask}
          onClose={() => setEditingTask(null)}
        />
      )}
    </div>
  );
}
