import { useTranslation } from "react-i18next";
import { Pencil } from "lucide-react";
import { useCategories } from "../../context/CategoriesContext";
import { calcTacticScore, calcWeekScore } from "../../lib/executionScore";

function TacticProgress({ tactic, weekTasks }) {
  const { t } = useTranslation();
  const doneTasks = weekTasks.filter((t) => t.tactic_id === tactic.id && t.done);
  const type = tactic.tactic_type ?? "count";
  const actualHours = doneTasks.reduce((s, t) => s + (t.actual_duration ?? 0), 0);
  const actualSessions = doneTasks.length;

  if (type === "sessions+hours") {
    return (
      <span className="tactic-progress">
        {t("chapter.tactic.prog_sessions", {
          actual: actualSessions,
          target: tactic.target_sessions ?? "?",
          hours: actualHours,
          targetHours: tactic.target_hours ?? "?",
        })}
      </span>
    );
  }
  if (type === "hours") {
    return (
      <span className="tactic-progress">
        {t("chapter.tactic.prog_hours", {
          hours: actualHours,
          targetHours: tactic.target_hours ?? "?",
        })}
      </span>
    );
  }
  return (
    <span className="tactic-progress">
      {t("chapter.tactic.prog_count", {
        count: actualSessions,
        target: tactic.target_count ?? "?",
      })}
    </span>
  );
}

function TacticRow({ tactic, weekTasks }) {
  const { t } = useTranslation();
  const score = calcTacticScore(tactic, weekTasks);
  const pct = Math.round(score * 100);
  const tagTasks = weekTasks.filter((t) => t.tactic_id === tactic.id);
  const fillClass =
    pct >= 85 ? "tactic-row__fill--ok" : pct > 0 ? "tactic-row__fill--teal" : "";
  const pctClass = pct >= 85 ? "tactic-row__pct--ok" : "tactic-row__pct--mid";

  return (
    <div className="tactic-row">
      <div className="tactic-row__header">
        <div className="tactic-row__info">
          <div className="tactic-row__name">{tactic.text}</div>
          <TacticProgress tactic={tactic} weekTasks={weekTasks} />
        </div>

        <div className="tactic-row__bar">
          <div className="tactic-row__track">
            <div className={`tactic-row__fill ${fillClass}`} style={{ width: `${pct}%` }} />
          </div>
          <span className={`tactic-row__pct ${pctClass}`}>{pct}%</span>
        </div>
      </div>

      {tagTasks.map((task) => (
        <div
          key={task.id}
          className={`tactic-task ${task.done ? "tactic-task--done" : "tactic-task--pending"}`}
        >
          <span>{task.done ? "✓" : "○"}</span>
          <span className={task.done ? "tactic-task__text--done" : ""}>{task.text}</span>
          {task.actual_duration && (
            <span className="tactic-task__dur">{task.actual_duration}ч</span>
          )}
        </div>
      ))}

      <div className="tactic-row__divider" />
    </div>
  );
}

function scoreVariant(pct) {
  if (pct >= 85) return "ok";
  if (pct >= 50) return "warning";
  return "missed";
}

export default function TargetCard({
  target,
  tactics,
  tasks,
  checkpoints,
  currentWeek,
  goals,
  onEdit,
}) {
  const { t } = useTranslation();
  const { cats } = useCategories();
  const targetTactics = tactics.filter((tac) => tac.target_id === target.id);
  const targetCheckpoints = checkpoints?.filter((c) => c.target_id === target.id) ?? [];
  const weekTasks = tasks.filter((task) => task.week === currentWeek);
  const linkedGoal = goals?.find((g) => g.id === target.life_direction_id);
  const catStyle = linkedGoal?.cat ? cats[linkedGoal.cat] : null;
  const borderColor = catStyle?.dot ?? "var(--c-teal)";
  const targetScore =
    targetTactics.length > 0
      ? Math.round(calcWeekScore(targetTactics, weekTasks) * 100)
      : null;
  const variant = targetScore != null ? scoreVariant(targetScore) : null;

  return (
    <div className="card" style={{ borderRight: `3px solid ${borderColor}` }}>
      <div className="target-card__header">
        <div className="target-card__info">
          <div className="target-card__title">{target.title}</div>
          {targetScore != null && (
            <div className={`target-card__week-score target-card__week-score--${variant}`}>
              <div className="target-score-track">
                <div
                  className={`tactic-row__fill tactic-row__fill--${variant === "ok" ? "ok" : "teal"}`}
                  style={{ width: `${targetScore}%` }}
                />
              </div>
              {targetScore}{t("chapter.thisWeek")}
            </div>
          )}
        </div>

        <div className="target-card__actions">
          <button className="btn-ghost" onClick={onEdit} title={t("chapter.target.editTitle")}>
            <Pencil size={13} />
          </button>
        </div>
      </div>

      {targetTactics.map((tac) => (
        <TacticRow key={tac.id} tactic={tac} weekTasks={weekTasks} />
      ))}

      {targetTactics.length === 0 && (
        <div className="empty">{t("chapter.target.noTactics")}</div>
      )}

      {targetCheckpoints.length > 0 && (
        <div>
          <div className="section-title section-title--dim" style={{ marginTop: 10 }}>
            {t("chapter.target.sectionCheckpoints")}
          </div>
          {targetCheckpoints.map((cp) => (
            <div
              key={cp.id}
              className={`target-checkpoint-item ${cp.done ? "target-checkpoint-item--done" : "target-checkpoint-item--pending"}`}
            >
              <span>{cp.done ? "✓" : "○"}</span>
              <span style={{ textDecoration: cp.done ? "line-through" : "none" }}>
                {cp.title}
              </span>
              {cp.target_week && (
                <span className="target-checkpoint-item__week">{cp.target_week}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
