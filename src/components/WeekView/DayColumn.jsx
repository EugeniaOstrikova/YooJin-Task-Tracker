import TaskCard from "../shared/TaskCard";
import { formatDuration } from "../../lib/weekUtils";

export default function DayColumn({ day, tasks, onToggle }) {
  const { shortLabel, isToday } = day;
  const totalHours = tasks.reduce((sum, t) => sum + (t.duration ?? 0), 0);
  const totalLabel = formatDuration(totalHours);

  return (
    <div className={`day-col${isToday ? " day-col--today" : ""}`}>
      <div className={`day-col__header${isToday ? " day-col__header--today" : ""}`}>
        {shortLabel}
        {isToday && <span className="badge badge--today">сегодня</span>}
      </div>

      {tasks.length === 0
        ? <div className="empty">—</div>
        : tasks.map(t => <TaskCard key={t.id} task={t} onToggle={onToggle} />)
      }

      {totalLabel && (
        <div className="day-col__footer">총 {totalLabel}</div>
      )}
    </div>
  );
}
