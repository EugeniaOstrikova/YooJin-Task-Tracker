import { useState } from "react";
import { ArrowLeft, Trash2, CheckCircle2, Circle } from "lucide-react";
import { useChapterDetail } from "../../hooks/useChapter";
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

function TacticRow({ tactic, weekTasks }) {
  const score = calcTacticScore(tactic, weekTasks);
  const pct = Math.round(score * 100);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "5px 0",
        borderBottom: "1px solid var(--c-border)",
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: "var(--c-ink)" }}>
          {tactic.text}
        </div>
        <div style={{ fontSize: 10, color: "var(--c-dim)" }}>#{tactic.tag}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div
          style={{
            width: 60,
            height: 3,
            background: "var(--c-border)",
            borderRadius: 2,
          }}
        >
          <div
            style={{
              height: "100%",
              borderRadius: 2,
              background:
                pct >= 85
                  ? "var(--c-ok)"
                  : pct > 0
                    ? "var(--c-teal)"
                    : "var(--c-border)",
              width: `${pct}%`,
            }}
          />
        </div>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: pct >= 85 ? "var(--c-ok)" : "var(--c-mid)",
            minWidth: 30,
            textAlign: "right",
          }}
        >
          {pct}%
        </span>
      </div>
    </div>
  );
}

function TargetCard({ target, tactics, tasks, currentWeek }) {
  const targetTactics = tactics.filter((t) => t.target_id === target.id);
  const weekTasks = tasks.filter((t) => t.week === currentWeek);

  return (
    <div className="card" style={{ borderTop: "2px solid var(--c-teal)" }}>
      <div
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: "var(--c-ink)",
          marginBottom: 12,
        }}
      >
        {target.title}
      </div>
      {targetTactics.map((tac) => (
        <TacticRow key={tac.id} tactic={tac} weekTasks={weekTasks} />
      ))}
      {targetTactics.length === 0 && <div className="empty">Нет тактик</div>}
    </div>
  );
}

function WeekBlock({
  weekId,
  weekNum,
  score,
  checkpoints,
  isCurrent,
  isPast,
  onNavigate,
}) {
  const pct = score != null ? Math.round(score * 100) : null;
  const chk = checkpoints.filter((c) => c.target_week === weekId);

  return (
    <div
      onClick={() => onNavigate(weekId)}
      style={{
        flex: "1 1 0",
        minWidth: 0,
        padding: "8px 6px",
        borderRadius: "var(--r-md)",
        cursor: "pointer",
        background: isCurrent ? "var(--c-teal-bg)" : "var(--c-bg)",
        border: isCurrent
          ? "1.5px solid var(--c-teal-bd)"
          : "1px solid var(--c-border)",
        opacity: !isPast && !isCurrent ? 0.6 : 1,
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: isCurrent ? "var(--c-teal)" : "var(--c-dim)",
        }}
      >
        W{weekNum}
      </div>
      {pct != null && (
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color:
              pct >= 85
                ? "var(--c-ok)"
                : pct > 0
                  ? "var(--c-mid)"
                  : "var(--c-faint)",
          }}
        >
          {pct}%
        </div>
      )}
      {chk.length > 0 && (
        <div style={{ fontSize: 9, color: "var(--c-teal)", marginTop: 2 }}>
          ●
        </div>
      )}
    </div>
  );
}

export default function ChapterDetail({ chapter, tasks, onBack, onDelete }) {
  const { targets, tactics, checkpoints, loading, saveCheckpoint } =
    useChapterDetail(chapter.id);
  const currentWeek = getCurrentWeekId();
  const endWeek = getChapterEndWeek(chapter);
  const weeks = getWeeksBetween(chapter.start_week, endWeek);
  const weekNum = weeks.indexOf(currentWeek) + 1;
  const score = calcExecutionScore(chapter, tactics, tasks);

  if (loading) return <div className="screen-loading">Загрузка...</div>;

  return (
    <div style={{ padding: "20px 20px 40px" }}>
      {/* Навигация */}
      <button
        className="btn-ghost"
        onClick={onBack}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 20,
          color: "var(--c-mid)",
        }}
      >
        <ArrowLeft size={16} /> Все главы
      </button>

      {/* Заголовок */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 24,
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 700,
              color: "var(--c-ink)",
            }}
          >
            {chapter.title}
          </h2>
          <div style={{ fontSize: 13, color: "var(--c-dim)", marginTop: 4 }}>
            {weekNum > 0 && weekNum <= chapter.duration_weeks
              ? `Неделя ${weekNum} из ${chapter.duration_weeks} · ${formatWeekRange(currentWeek)}`
              : `${chapter.start_week} · ${chapter.duration_weeks} недель`}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {score && (
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: score.score >= 0.85 ? "var(--c-ok)" : "var(--c-teal)",
                }}
              >
                {Math.round(score.score * 100)}%
              </div>
              <div style={{ fontSize: 11, color: "var(--c-dim)" }}>
                Execution Score · {score.passed}/{score.total} недель
              </div>
            </div>
          )}
          <button
            className="btn-ghost"
            onClick={() => onDelete(chapter.id)}
            style={{ color: "var(--c-missed)" }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Карточки ориентиров */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${Math.min(targets.length, 3)}, 1fr)`,
          gap: 12,
          marginBottom: 24,
        }}
      >
        {targets.map((target) => (
          <TargetCard
            key={target.id}
            target={target}
            tactics={tactics}
            tasks={tasks}
            currentWeek={currentWeek}
          />
        ))}
      </div>

      {/* 12-недельный таймлайн */}
      <div
        style={{
          background: "var(--c-white)",
          border: "1px solid var(--c-border)",
          borderRadius: "var(--r-lg)",
          padding: 16,
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "var(--c-dim)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 12,
          }}
        >
          Timeline · {chapter.duration_weeks} недель
        </div>
        <div
          style={{
            display: "flex",
            gap: 4,
            flexWrap: "nowrap",
            overflowX: "auto",
          }}
        >
          {weeks.map((weekId, i) => {
            const isPast = weekId < currentWeek;
            const isCurrent = weekId === currentWeek;
            const weekTasks = tasks.filter((t) => t.week === weekId);
            const weekScore = isPast ? calcWeekScore(tactics, weekTasks) : null;

            return (
              <WeekBlock
                key={weekId}
                weekId={weekId}
                weekNum={i + 1}
                score={weekScore}
                checkpoints={checkpoints}
                isCurrent={isCurrent}
                isPast={isPast}
                onNavigate={() => {}}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
