import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import TaskCard from "../shared/TaskCard";
import { formatDuration } from "../../lib/weekUtils";
import { Calendar, Link2, X, CalendarCheck, Plus } from "lucide-react";
import TaskEditModal from "../shared/TaskEditModal";
import { useDroppable } from "@dnd-kit/core";

export default function DayColumn({ day, tasks, onToggle, calEvents = [], onUpdateTask, onAddTask, weekId }) {
  const { shortLabel, isToday } = day;
  const [linkingEventId, setLinkingEventId] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [creating, setCreating] = useState(false);
  const { setNodeRef, isOver } = useDroppable({ id: day.iso });
  const { t, i18n } = useTranslation();
  const locale = i18n.language;

  let planHours = 0;
  let factHours = 0;

  tasks.forEach(task => {
    if (task.linked_event_id) return;
    planHours += task.duration ?? 0;
    if (task.done) factHours += task.actual_duration ?? task.duration ?? 0;
  });

  calEvents.forEach(e => {
    const linked   = tasks.find(task => task.linked_event_id === e.id);
    const eventDur = e.durationHours ?? 0;
    if (linked) {
      const planned  = Math.max(linked.duration ?? 0, eventDur);
      const actual   = Math.max(linked.actual_duration ?? linked.duration ?? 0, eventDur);
      planHours += planned;
      if (linked.done) factHours += actual;
    } else {
      planHours += eventDur;
    }
  });

  const planLabel = formatDuration(planHours, locale);
  const factLabel = formatDuration(factHours, locale);

  function handleLink(taskId, eventId) {
    onUpdateTask(taskId, { linked_event_id: eventId });
    setLinkingEventId(null);
  }

  function handleUnlink(taskId) {
    onUpdateTask(taskId, { linked_event_id: null });
  }

  const linkedTaskIds = new Set(
    tasks.filter(task => task.linked_event_id).map(task => task.id)
  );

  function handleCompleteEvent(e) {
    onAddTask([{
      id:              `auto_${e.id}_${Date.now()}`,
      text:            e.title,
      week:            weekId,
      day:             e.date,
      cat:             "other",
      duration:        e.durationHours ?? 0,
      actual_duration: e.durationHours ?? 0,
      done:            true,
      completed_at:    new Date().toISOString(),
      linked_event_id: e.id,
    }]);
  }

  return (
    <div
      ref={setNodeRef}
      className={`day-col${isToday ? " day-col--today" : ""}`}
    >
      <div className={`day-col__header${isToday ? " day-col__header--today" : ""}`}>
        {shortLabel}
        <button
          className="btn-icon-nav"
          onClick={() => setCreating(true)}
        >
          <Plus size={14} />
        </button>
        {isToday && <span className="badge badge--today">{t("dayColumn.today")}</span>}
      </div>

      {tasks.length === 0
        ? <div className="empty">—</div>
        : tasks.map(task =>
          <TaskCard
            key={task.id}
            task={task}
            onToggle={onToggle}
            onEdit={setEditingTask}
            onSave={onUpdateTask}
            linked={!!task.linked_event_id}
          />)
      }

      {calEvents.length > 0 && (
        <div className="day-col__calendar">
          {calEvents.map(e => {
            const linkedTask = tasks.find(task => task.linked_event_id === e.id);
            const isLinking  = linkingEventId === e.id;
            const unlinkableTasks = tasks.filter(task => !task.linked_event_id || task.linked_event_id === e.id);
            const isCompleted = !!linkedTask?.done;

            return (
              <div key={e.id} className={isCompleted ? "calendar-card__completed" : ""} >
                <div className="calendar-card__content">
                  {isCompleted ? (
                    <CalendarCheck
                      size={14}
                      className="calendar-icon"
                      color="var(--c-teal)"
                      onClick={() => onUpdateTask(linkedTask.id, { done: false, actual_duration: null })}
                    />
                  ) : (
                    <Calendar
                      size={14}
                      className="calendar-icon"
                      color="var(--c-dim)"
                      onClick={() => handleCompleteEvent(e)}
                    />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="calendar-card__name">
                      <span className="calendar-card__text">{e.title}</span>
                      {!linkedTask && (
                        isLinking ? (
                          <X size={14} className="calendar-icon" onClick={() => setLinkingEventId(isLinking ? null : e.id)}/>
                        ) : (
                          <Link2 size={14} className="calendar-icon" onClick={() => setLinkingEventId(isLinking ? null : e.id)} />
                        )
                      )}
                    </div>
                    {e.time && (
                      <div className="task-card__dur">{e.time}</div>
                    )}
                    {linkedTask && (
                      <div className="calendar__linked-task">
                        <Link2 size={12} className="calendar-icon" />
                        <span className="calendar__linked-task-text">{linkedTask.text}</span>
                        <X size={12} className="calendar-icon" onClick={() => handleUnlink(linkedTask.id)} />
                      </div>
                    )}
                    {isLinking && (
                      <select
                        className="cal-event__link-select"
                        defaultValue=""
                        onChange={e2 => e2.target.value && handleLink(e2.target.value, e.id)}
                      >
                        <option value="">{t("dayColumn.selectTask")}</option>
                        {unlinkableTasks.map(task => (
                          <option key={task.id} value={task.id}>{task.text}</option>
                        ))}
                      </select>
                    )}
                  </div>
                  {e.durationHours && (
                    <span className="task-card__dur">{formatDuration(e.durationHours, locale)}</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {(planLabel || factLabel) && (
        <div className="day-col__footer">
          {planLabel && <span>{t("weekView.planPrefix")} {planLabel}</span>}
          {planLabel && factLabel && <span> · </span>}
          {factLabel && <span>{t("weekView.factPrefix")} {factLabel}</span>}
        </div>
      )}

      {editingTask && (
        <TaskEditModal
          task={editingTask}
          onSave={onUpdateTask}
          onClose={() => setEditingTask(null)}
        />
      )}

      {creating && (
        <TaskEditModal
          defaultDay={day.iso}
          weekId={weekId}
          onAdd={onAddTask}
          onClose={() => setCreating(false)}
        />
      )}
    </div>
  );
}
