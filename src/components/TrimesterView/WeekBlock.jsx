import TaskCard        from "../shared/TaskCard";
import { formatWeekRange, isCycleWeek } from "../../lib/weekUtils";

export default function WeekBlock({ weekId, tasks, onToggle, onNavigate }) {
  const isCycle = isCycleWeek(weekId);
  const done    = tasks.filter(t => t.done).length;
  const total   = tasks.length;
  const pct     = total ? Math.round((done / total) * 100) : 0;
  const allDone = total > 0 && done === total;

  return (
    <div className={`week-block${isCycle ? " week-block--cycle" : ""}${allDone ? " week-block--done" : ""}`}>

      <div className={`week-block__head${isCycle ? " week-block__head--cycle" : ""}`}>
        <button onClick={() => onNavigate(weekId)} className="week-block__nav">
          <span className="week-block__id">{weekId}</span>
          <span className="week-block__range">{formatWeekRange(weekId)}</span>
        </button>

        {isCycle && <span className="badge--cycle-sm">🌀 цикл</span>}

        <div className="week-block__meta">
          {total > 0 && (
            <>
              <div className="week-block__mini-track">
                <div
                  className={`week-block__mini-fill${allDone ? " week-block__mini-fill--done" : ""}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className={`week-block__count${allDone ? " week-block__count--done" : ""}`}>
                {done}/{total}
              </span>
            </>
          )}
          {total === 0 && <span className="week-block__no-tasks">нет задач</span>}
        </div>
      </div>

      {tasks.map(t => (
        <TaskCard key={t.id} task={t} onToggle={onToggle} compact />
      ))}
    </div>
  );
}
