import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Trash2, Plus } from "lucide-react";
import { useChapterDetail } from "../../hooks/useChapter";
import WeekTimeline from "./WeekTimeline";
import TargetCard from "./TargetCard";
import TargetModal from "./TargetModal";
import ProgressBar from "../shared/ProgressBar";
import {
  calcWeekScore,
  calcExecutionScore,
  getChapterEndWeek,
} from "../../lib/executionScore";
import {
  getWeeksBetween,
  getCurrentWeekId,
  formatWeekRange,
} from "../../lib/weekUtils";
import { useGoals } from "../../hooks/useGoals";

export default function ChapterDetail({ chapter, tasks, onBack, onDelete }) {
  const { t } = useTranslation();
  const {
    targets,
    tactics,
    checkpoints,
    loading,
    saveTarget,
    saveTactic,
    removeTactic,
    saveCheckpoint,
    removeCheckpoint,
  } = useChapterDetail(chapter.id);

  const currentWeek = getCurrentWeekId();
  const endWeek = getChapterEndWeek(chapter);
  const weeks = getWeeksBetween(chapter.start_week, endWeek);
  const weekNum = weeks.indexOf(currentWeek) + 1;
  const score = calcExecutionScore(chapter, tactics, tasks);

  const [editingTarget, setEditingTarget] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);

  const { goals } = useGoals();

  const currentWeekTasks = tasks.filter((t) => t.week === selectedWeek);
  const weekScore = calcWeekScore(tactics, currentWeekTasks);
  const weekPct = weekScore != null ? Math.round(weekScore * 100) : null;
  const weekPassed = weekPct != null && weekPct >= 85;
  const progressVariant = weekPassed ? "ok" : weekPct >= 50 ? "warning" : "missed";

  if (loading) return <div className="screen-loading">{t("review.loading")}</div>;

  function openNewTarget() {
    setEditingTarget({
      id: `target_${Date.now()}`,
      chapter_id: chapter.id,
      title: "",
      life_direction_id: null,
      sort: targets.length,
    });
  }

  return (
    <div className="chapter-detail">
      <button className="btn-ghost btn-back" onClick={onBack}>
        <ArrowLeft size={16} /> {t("chapter.backBtn")}
      </button>

      <div className="chapter-header">
        <div>
          <h2 className="chapter-title">{chapter.title}</h2>
          <div className="chapter-subtitle">
            {weekNum > 0 && weekNum <= chapter.duration_weeks
              ? `${t("chapter.weekOf", { num: weekNum, total: chapter.duration_weeks })} · ${formatWeekRange(currentWeek)}`
              : `${chapter.start_week} · ${t("chapter.weeksCount", { n: chapter.duration_weeks })}`}
          </div>
        </div>

        <div className="chapter-header__actions">
          {score && (
            <div className="chapter-score">
              <div className={`chapter-score__pct chapter-score__pct--${score.score >= 0.85 ? "ok" : "teal"}`}>
                {Math.round(score.score * 100)}%
              </div>
              <div className="chapter-score__meta">
                {score.passed}/{score.total} {t("chapter.weeksShort")}
              </div>
            </div>
          )}

          <button className="btn-primary btn--icon" onClick={openNewTarget}>
            <Plus size={14} /> {t("chapter.addTargetBtn")}
          </button>

          <button className="btn-ghost btn-ghost--danger" onClick={() => onDelete(chapter.id)}>
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {weekPct != null && (
        <div className={`chapter-week-progress chapter-week-progress--${progressVariant}`}>
          <div className="chapter-week-progress__bar">
            <div className="chapter-week-progress__bar-label">
              {selectedWeek === currentWeek
                ? t("chapter.progress.title")
                : t("chapter.progress.titleWeek", { week: selectedWeek })}
            </div>
            <ProgressBar pct={weekPct} variant={progressVariant} size="thick" />
          </div>
          <div className="chapter-week-progress__right">
            <div className={`chapter-week-progress__pct chapter-week-progress__pct--${progressVariant}`}>
              {weekPct}%
            </div>
            <div className="chapter-week-progress__hint">
              {weekPassed
                ? t("chapter.progress.passed")
                : t("chapter.progress.needed", { pct: 85 - weekPct })}
            </div>
          </div>
        </div>
      )}

      <div
        className="chapter-targets-grid"
        style={{ gridTemplateColumns: `repeat(${Math.min(targets.length, 3)}, 1fr)` }}
      >
        {targets.map((target) => (
          <TargetCard
            key={target.id}
            target={target}
            tactics={tactics}
            tasks={tasks}
            checkpoints={checkpoints}
            currentWeek={selectedWeek}
            goals={goals}
            onEdit={() => setEditingTarget(target)}
          />
        ))}
      </div>

      <WeekTimeline
        weeks={weeks}
        tasks={tasks}
        tactics={tactics}
        checkpoints={checkpoints}
        currentWeek={currentWeek}
        duration={chapter.duration_weeks}
        targets={targets}
        goals={goals}
      />

      {editingTarget && (
        <TargetModal
          target={editingTarget}
          tactics={tactics.filter((tac) => tac.target_id === editingTarget.id)}
          checkpoints={checkpoints.filter((c) => c.target_id === editingTarget.id)}
          goals={goals}
          chapterId={chapter.id}
          isNew={!targets.some((tg) => tg.id === editingTarget.id)}
          onSaveTarget={saveTarget}
          onSaveTactic={saveTactic}
          onRemoveTactic={removeTactic}
          onSaveCheckpoint={saveCheckpoint}
          onRemoveCheckpoint={removeCheckpoint}
          onClose={() => setEditingTarget(null)}
        />
      )}
    </div>
  );
}
