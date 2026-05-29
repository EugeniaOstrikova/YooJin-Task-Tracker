import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { useChapters } from "../../hooks/useChapter";
import { upsertTarget, upsertTactic } from "../../lib/chaptersStorage";
import ProgressBar from "../shared/ProgressBar";
import { useTasks } from "../../hooks/useTasks";
import {
  calcExecutionScore,
  getChapterEndWeek,
} from "../../lib/executionScore";
import { getCurrentWeekId, getWeeksBetween } from "../../lib/weekUtils";
import CreateChapterModal from "./CreateChapterModal";
import ChapterDetail from "./ChapterDetail";

function ChapterCard({ chapter, tasks, onClick }) {
  const { t } = useTranslation();
  const current = getCurrentWeekId();
  const weeks = getWeeksBetween(chapter.start_week, getChapterEndWeek(chapter));
  const weekNum = weeks.indexOf(current) + 1;
  const score = calcExecutionScore(chapter, [], tasks);
  const isActive = weekNum > 0 && weekNum <= chapter.duration_weeks;

  return (
    <div
      className="card"
      onClick={onClick}
      style={{ cursor: "pointer", borderTop: "3px solid var(--c-teal)" }}
    >
      <div className="chapter-card__title">{chapter.title}</div>
      <div className="chapter-card__meta">
        {chapter.start_week} ·{" "}
        {t("chapter.weeksCount", { n: chapter.duration_weeks })}
        {isActive && (
          <span className="chapter-card__meta-active">
            {" "}
            ·{" "}
            {t("chapter.weekOf", {
              num: weekNum,
              total: chapter.duration_weeks,
            })}
          </span>
        )}
      </div>

      {score && (
        <div>
          <div className="chapter-card__score-row">
            <span className="chapter-card__score-label">
              {t("chapter.executionScore")}
            </span>
            <span className="chapter-card__score-value">
              {Math.round(score.score * 100)}% · {score.passed}/{score.total}{" "}
              {t("chapter.weeksShort")}
            </span>
          </div>
          <ProgressBar pct={Math.round(score.score * 100)} />
        </div>
      )}
    </div>
  );
}

export default function ChapterView({ activeChapterId, onClearActiveChapter }) {
  const { t } = useTranslation();
  const { chapters, loading, saveChapter, removeChapter } = useChapters();
  const { tasks } = useTasks();
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState(null);

  async function handleCreate({ chapter, targets, tactics }) {
    await saveChapter(chapter);
    for (const tg of targets) await upsertTarget(tg);
    for (const tac of tactics) await upsertTactic(tac);
  }

  useEffect(() => {
    if (activeChapterId && chapters.length > 0) {
      const chapter = chapters.find((ch) => ch.id === activeChapterId);
      if (chapter) {
        setSelected(chapter);
        onClearActiveChapter?.();
      }
    }
  }, [activeChapterId, chapters]);

  if (loading)
    return <div className="screen-loading">{t("review.loading")}</div>;

  if (selected) {
    return (
      <ChapterDetail
        chapter={selected}
        tasks={tasks}
        onBack={() => setSelected(null)}
        onDelete={async (id) => {
          await removeChapter(id);
          setSelected(null);
        }}
      />
    );
  }

  return (
    <div className="chapter-view">
      <div className="chapter-view__header">
        <div>
          <div className="chapter-view__title">{t("chapter.listTitle")}</div>
          <div className="chapter-view__subtitle">
            {t("chapter.listSubtitle")}
          </div>
        </div>
        <button
          className="btn-primary btn--icon"
          onClick={() => setCreating(true)}
        >
          <Plus size={14} /> {t("chapter.create.newBtn")}
        </button>
      </div>

      {chapters.length === 0 ? (
        <div className="empty--center">
          {t("chapter.listEmpty")}
          <br />
          <span style={{ fontSize: 12 }}>{t("chapter.listEmptyHint")}</span>
        </div>
      ) : (
        <div className="chapter-grid">
          {chapters.map((ch) => (
            <ChapterCard
              key={ch.id}
              chapter={ch}
              tasks={tasks}
              onClick={() => setSelected(ch)}
            />
          ))}
        </div>
      )}

      {creating && (
        <CreateChapterModal
          onSave={handleCreate}
          onClose={() => setCreating(false)}
        />
      )}
    </div>
  );
}
