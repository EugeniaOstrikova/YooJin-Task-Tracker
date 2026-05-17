import { useState } from "react";
import WeekBlock from "./WeekBlock";
import { TRIMESTERS, getTrimesterForWeek } from "../../config/trimesters";
import { getWeeksBetween, getCurrentWeekId, getMonthLabel } from "../../lib/weekUtils";

export default function TrimesterView({ tasks, onToggle, onNavigateWeek, currentWeekId }) {
  const currentTrimester = getTrimesterForWeek(currentWeekId) ?? TRIMESTERS[0];
  const [selectedId, setSelectedId] = useState(currentTrimester.id);

  const trimester = TRIMESTERS.find(t => t.id === selectedId) ?? TRIMESTERS[0];
  const weeks     = getWeeksBetween(trimester.start, trimester.end);

  const trimTasks = tasks.filter(t => t.week >= trimester.start && t.week <= trimester.end);
  const trimDone  = trimTasks.filter(t => t.done).length;
  const trimTotal = trimTasks.length;
  const trimPct   = trimTotal ? Math.round((trimDone / trimTotal) * 100) : 0;

  return (
    <div className="trim-view">

      {/* ── Переключатель триместров ── */}
      <div className="trim-selector">
        {TRIMESTERS.map(t => (
          <button
            key={t.id}
            onClick={() => setSelectedId(t.id)}
            className={`trim-btn${selectedId === t.id ? " is-active" : ""}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Прогресс триместра ── */}
      <div className="trim-progress">
        <div className="trim-progress__row">
          <span className="trim-progress__label">{trimester.label}</span>
          <span className={`trim-progress__pct${trimPct === 100 ? " trim-progress__pct--done" : ""}`}>
            {trimDone}/{trimTotal} · {trimPct}%
          </span>
        </div>
        <div className="progress-track progress-track--thick">
          <div
            className={`progress-fill${trimPct === 100 ? " progress-fill--done" : ""}`}
            style={{ width: `${trimPct}%` }}
          />
        </div>
      </div>

      {/* ── Сетка недель ── */}
      <div className="trim-grid">
        {weeks.map(wId => (
          <WeekBlock
            key={wId}
            weekId={wId}
            tasks={tasks.filter(t => t.week === wId)}
            onToggle={onToggle}
            onNavigate={id => onNavigateWeek(id)}
          />
        ))}
      </div>

      {trimTotal === 0 && (
        <div className="empty empty--lg">
          В этом триместре задач нет.<br />
          <span style={{ fontSize: 12 }}>Добавь через «Импорт» ↑</span>
        </div>
      )}
    </div>
  );
}
