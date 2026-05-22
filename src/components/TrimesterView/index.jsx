import { useState } from "react";
import { useTranslation } from "react-i18next";
import WeekBlock from "./WeekBlock";
import { TRIMESTERS, getTrimesterForWeek } from "../../config/trimesters";
import { getWeeksBetween, getTrimesterTasks } from "../../lib/weekUtils";
import TrimesterSelector from "../shared/TrimesterSelector";

export default function TrimesterView({ tasks, onToggle, onNavigateWeek, currentWeekId }) {
  const currentTrimester = getTrimesterForWeek(currentWeekId) ?? TRIMESTERS[0];
  const [selectedId, setSelectedId] = useState(currentTrimester.id);
  const { t, i18n } = useTranslation();

  const trimester = TRIMESTERS.find(tr => tr.id === selectedId) ?? TRIMESTERS[0];
  const weeks     = getWeeksBetween(trimester.start, trimester.end);

  const { tasks: trimTasks, done: trimDone, total: trimTotal, pct: trimPct } = getTrimesterTasks(tasks, trimester);

  return (
    <div className="trim-view">

      <TrimesterSelector selected={selectedId} onChange={setSelectedId} />

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

      <div className="trim-grid">
        {weeks.map(wId => (
          <WeekBlock
            key={wId}
            weekId={wId}
            tasks={tasks.filter(task => task.week === wId)}
            onToggle={onToggle}
            onNavigate={id => onNavigateWeek(id)}
          />
        ))}
      </div>

      {trimTotal === 0 && (
        <div className="empty empty--lg">
          {t("trimesterView.empty")}<br />
          <span style={{ fontSize: 12 }}>{t("trimesterView.emptyHint")}</span>
        </div>
      )}
    </div>
  );
}
