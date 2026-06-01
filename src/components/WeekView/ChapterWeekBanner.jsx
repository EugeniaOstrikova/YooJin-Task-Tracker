import { useChapterDetail } from "../../hooks/useChapter";
import {
  calcWeekScore,
  calcTacticScore,
  getChapterEndWeek,
} from "../../lib/executionScore";
import { getWeeksBetween } from "../../lib/weekUtils";

export function ChapterWeekBanner({ chapter, tasks, weekId, onNavigate }) {
  const { tactics } = useChapterDetail(chapter.id);
  const weekTasks = tasks.filter((t) => t.week === weekId);
  const weekScore = calcWeekScore(tactics, weekTasks);
  const weekPct = weekScore != null ? Math.round(weekScore * 100) : null;
  const weeks = getWeeksBetween(chapter.start_week, getChapterEndWeek(chapter));
  const weekNum = weeks.indexOf(weekId) + 1;

  const scoreColor =
    weekPct == null
      ? "var(--c-dim)"
      : weekPct >= 85
        ? "#16A34A"
        : weekPct >= 50
          ? "var(--c-late)"
          : "var(--c-missed)";

  return (
    <div
      onClick={onNavigate}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "8px 14px",
        marginBottom: 12,
        background: "var(--c-teal-bg)",
        border: "1px solid var(--c-teal-bd)",
        borderRadius: "var(--r-md)",
        cursor: "pointer",
      }}
    >
      {/* Название главы */}
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "var(--c-accent)",
          flexShrink: 0,
        }}
      >
        {chapter.title}
      </div>

      <div style={{ fontSize: 11, color: "var(--c-dim)", flexShrink: 0 }}>
        W{weekNum} из {chapter.duration_weeks}
      </div>

      {/* Прогресс бар */}
      {weekPct != null && (
        <>
          <div
            style={{
              flex: 1,
              height: 4,
              background: "var(--c-white)",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${weekPct}%`,
                background: scoreColor,
                borderRadius: 2,
                transition: "width 0.3s",
              }}
            />
          </div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: scoreColor,
              flexShrink: 0,
            }}
          >
            {weekPct}%
          </div>
        </>
      )}

      {weekPct == null && (
        <div style={{ fontSize: 11, color: "var(--c-dim)" }}>нет данных</div>
      )}
    </div>
  );
}
