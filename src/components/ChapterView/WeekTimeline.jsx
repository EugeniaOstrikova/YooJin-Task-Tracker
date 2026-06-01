import { useState } from "react";
import { useTranslation } from "react-i18next";
import { calcWeekScore } from "../../lib/executionScore";
import { formatWeekRange, formatShortDate } from "../../lib/weekUtils";
import { useCategories } from "../../context/CategoriesContext";

function CheckpointDot({ color, done, style }) {
  return (
    <div
      style={{
        width: 6,
        height: 6,
        borderRadius: "50%",
        flexShrink: 0,
        background: color ?? "var(--c-teal)",
        opacity: done ? 0.4 : 1,
        ...style,
      }}
    />
  );
}

function CheckpointRow({ checkpoint, color }) {
  return (
    <div className="timeline-checkpoint">
      <CheckpointDot
        color={color}
        done={checkpoint.done}
        style={{ marginTop: 3 }}
      />
      <span className="timeline-checkpoint__text">
        {checkpoint.done ? "✓ " : ""}
        {checkpoint.title}
      </span>
    </div>
  );
}

function getScoreVariant(score, isPast) {
  if (!isPast || score == null) return "empty";
  if (score >= 0.85) return "ok";
  if (score >= 0.5) return "warning";
  return "missed";
}

function CompactWeekBlock({
  weekId,
  weekNum,
  score,
  checkpoints,
  isPast,
  checkpointColors,
}) {
  const { t } = useTranslation();
  const [showTooltip, setShowTooltip] = useState(false);
  const variant = getScoreVariant(score, isPast);
  const chk = checkpoints.filter((c) => c.target_week === weekId);
  const pct = score != null ? Math.round(score * 100) : null;

  return (
    <div style={{ position: "relative" }}>
      <div
        className={`timeline-week week-compact--${variant}`}
        onClick={() => setShowTooltip((p) => !p)}
      >
        <div className="timeline-week_label">W{weekNum}</div>
        <div className="text-subheader">{formatShortDate(weekId)}</div>
        {pct != null && <div className="week-compact__pct">{pct}%</div>}
        {chk.length > 0 ? (
          chk.map((c) => (
            <CheckpointRow
              key={c.id}
              checkpoint={c}
              color={checkpointColors?.[c.id]}
            />
          ))
        ) : (
          <div className="week-expanded__empty">—</div>
        )}
        {/* {chk.length > 0 && (
          <div className="week-compact__dots">
            {chk.map((c) => (
              <CheckpointDot
                key={c.id}
                color={checkpointColors[c.id]}
                checkpoint={c}
                // done={c.done}
              />
            ))}
          </div>
        )} */}
      </div>

      {showTooltip && (
        <div>
          <div
            style={{ position: "fixed", inset: 0, zIndex: 10 }}
            onClick={() => setShowTooltip(false)}
          />
          <div className="week-tooltip">
            <div className="week-tooltip__title">
              W{weekNum} · {formatWeekRange(weekId)}
            </div>
            {pct != null && (
              <div
                className="week-tooltip__pct"
                style={{
                  color: `var(--c-${variant === "ok" ? "ok" : variant === "warning" ? "late" : variant === "missed" ? "missed" : "dim"})`,
                  marginBottom: chk.length ? 6 : 0,
                }}
              >
                {t("chapter.timeline.execution", { pct })}
              </div>
            )}
            {chk.map((c) => (
              <CheckpointRow
                key={c.id}
                checkpoint={c}
                color={checkpointColors[c.id]}
              />
            ))}
            {!pct && !chk.length && (
              <div className="week-tooltip__empty">
                {t("chapter.timeline.noData")}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ExpandedWeekBlock({
  weekId,
  weekNum,
  checkpoints,
  isCurrent,
  label,
  checkpointColors,
}) {
  const { t } = useTranslation();
  const chk = checkpoints.filter((c) => c.target_week === weekId);
  const variant = isCurrent ? "current" : "next";

  return (
    <div className={`timeline-week week-expanded--${variant}`}>
      <div className="timeline-week_label">{label}</div>
      <div className="text-subheader">{formatShortDate(weekId)}</div>
      {chk.length > 0 ? (
        chk.map((c) => (
          <CheckpointRow
            key={c.id}
            checkpoint={c}
            color={checkpointColors?.[c.id]}
          />
        ))
      ) : (
        <div className="week-expanded__empty">—</div>
      )}
    </div>
  );
}

export default function WeekTimeline({
  weeks,
  tasks,
  tactics,
  checkpoints,
  currentWeek,
  duration,
  targets,
  goals,
}) {
  const { t } = useTranslation();
  const { cats } = useCategories();
  const currentIdx = weeks.indexOf(currentWeek);
  const nextWeek = weeks[currentIdx + 1];

  const checkpointColors = {};
  checkpoints.forEach((cp) => {
    const target = targets?.find((tg) => tg.id === cp.target_id);
    const goal = goals?.find((g) => g.id === target?.life_direction_id);
    const catStyle = goal?.cat ? cats[goal.cat] : null;
    checkpointColors[cp.id] = catStyle?.dot ?? "var(--c-teal)";
  });

  return (
    <div className="card" style={{ padding: 16 }}>
      <div
        className="section-title section-title--mid"
        style={{ marginBottom: 14 }}
      >
        {t("chapter.timeline.title", { weeks: duration })}
      </div>

      <div className="timeline__scroll">
        {weeks.slice(0, currentIdx).map((weekId, i) => {
          const weekTasks = tasks.filter((task) => task.week === weekId);
          const score = calcWeekScore(tactics, weekTasks);
          return (
            <CompactWeekBlock
              key={weekId}
              weekId={weekId}
              weekNum={i + 1}
              score={score}
              checkpoints={checkpoints}
              checkpointColors={checkpointColors}
              isPast
            />
          );
        })}

        {currentIdx >= 0 && (
          <ExpandedWeekBlock
            weekId={currentWeek}
            weekNum={currentIdx + 1}
            checkpoints={checkpoints}
            isCurrent
            label={t("chapter.timeline.current", { num: currentIdx + 1 })}
            checkpointColors={checkpointColors}
          />
        )}

        {nextWeek && (
          <ExpandedWeekBlock
            weekId={nextWeek}
            weekNum={currentIdx + 2}
            checkpoints={checkpoints}
            isCurrent={false}
            label={t("chapter.timeline.next", { num: currentIdx + 2 })}
            checkpointColors={checkpointColors}
          />
        )}

        {weeks.slice(currentIdx + 2).map((weekId, i) => (
          <CompactWeekBlock
            key={weekId}
            weekId={weekId}
            weekNum={currentIdx + 3 + i}
            score={null}
            checkpoints={checkpoints}
            checkpointColors={checkpointColors}
            isPast={false}
          />
        ))}
      </div>
    </div>
  );
}
