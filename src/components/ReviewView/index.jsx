import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useCategories } from "../../context/CategoriesContext";
import { useThemes } from "../../hooks/useThemes";
import { patchTask } from "../../lib/storage";
import { getCurrentWeekId, weekIdForDate, formatWeekRange } from "../../lib/weekUtils";
import { MessageCircle, X } from "lucide-react";
import { getCatCardStyle } from "../../lib/categoryStyles";

const getStatusMeta = (t) => ({
  missed: { label: t("review.statusMissed"), color: "var(--c-missed)", bg: "var(--c-missed-bg)" },
  late:   { label: t("review.statusLate"),   color: "var(--c-late)",   bg: "var(--c-late-bg)"   },
});

function isLate(task) {
  if (!task.done || !task.completed_at) return false;
  const completedDate = new Date(task.completed_at);
  if (task.day) return completedDate.toISOString().split("T")[0] > task.day;
  return weekIdForDate(completedDate) !== task.week;
}

function getStatus(task, currentWeekId) {
  if (!task.done && task.week < currentWeekId) return "missed";
  if (task.done && isLate(task))              return "late";
  return null;
}

function TaskEditModal({ task, themes, onSave, onClose, cats }) {
  const [themeId,  setThemeId]  = useState(task.theme_id ?? "");
  const [note,     setNote]     = useState(task.note ?? "");
  const [newTheme, setNewTheme] = useState("");
  const { t } = useTranslation();
  const status = getStatus(task, getCurrentWeekId());

  const STATUS_META = getStatusMeta(t);

  async function handleSave() {
    await onSave(task.id, { theme_id: themeId || null, note: note || null });
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>

        <div className="task-edit-header">
          <div>
            <div className="task-edit-title">{task.text}</div>
            <div className="task-edit-badges">
              {status && (
                <span className="badge" style={{ background: STATUS_META[status].bg, color: STATUS_META[status].color }}>
                  {STATUS_META[status].label}
                </span>
              )}
              <span className="badge" style={{ background: cats[task.cat]?.bg ?? "#F1F5F9", color: cats[task.cat]?.text ?? "var(--c-mid)" }}>
                {cats[task.cat]?.label ?? task.cat}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="btn-ghost">
            <X size={16} />
          </button>
        </div>

        <div className="task-edit-section">
          <label className="task-edit-label">{t("review.themeLabel")}</label>
          <select
            value={themeId}
            onChange={e => setThemeId(e.target.value)}
            className="select"
            style={{ marginBottom: 8 }}
          >
            <option value="">{t("review.noTheme")}</option>
            {themes.map(th => <option key={th.id} value={th.id}>{th.name}</option>)}
          </select>
          <div className="task-edit-row">
            <input
              value={newTheme}
              onChange={e => setNewTheme(e.target.value)}
              placeholder={t("review.newThemePlaceholder")}
              className="input input--inline"
            />
            <button
              onClick={async () => {
                if (!newTheme.trim()) return;
                const th = await onSave._addTheme(newTheme);
                if (th) { setThemeId(th.id); setNewTheme(""); }
              }}
              className="btn-add-theme"
            >
              {t("review.addTheme")}
            </button>
          </div>
        </div>

        <div className="task-edit-section">
          <label className="task-edit-label">{t("review.noteLabel")}</label>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder={t("review.notePlaceholder")}
            rows={3}
            className="textarea"
          />
        </div>

        <button onClick={handleSave} className="btn-full btn-full--teal">
          {t("review.save")}
        </button>
      </div>
    </div>
  );
}

function ReviewTaskCard({ task, status, onEdit, cats, statusMeta }) {
  const { t } = useTranslation();
  const cat = cats[task.cat];
  const s   = statusMeta[status];
  const cardStyle = getCatCardStyle(s);
  return (
    <div
      onClick={() => onEdit(task)}
      className="review-task"
      style={{border: `1px solid ${s.color}`, ...cardStyle}}
    >
      <div className="review-task__body">
        <div className="review-task__text">{task.text}</div>
        <div className="review-task__meta">
          {cat && (
            <span className="badge" style={{ fontSize: 10, padding: "1px 7px", background: cat.bg, color: cat.text }}>
              {cat.label}
            </span>
          )}
          {task.note && (
            <span style={{ fontSize: 10, color: "var(--c-dim)", fontStyle: "italic" }}>
              <MessageCircle size={12} /> {t("review.hasNote")}
            </span>
          )}
        </div>
      </div>
      <span className="review-task__arrow" style={{ color: s.color }}>→</span>
    </div>
  );
}

function groupByTheme(tasks, themes) {
  const map = {};
  tasks.forEach(task => {
    const found = themes.find(th => th.id === task.theme_id);
    const key = found ? task.theme_id : "__none__";
    if (!map[key]) map[key] = [];
    map[key].push(task);
  });

  return [
    ...Object.entries(map).filter(([k]) => k !== "__none__"),
    ...Object.entries(map).filter(([k]) => k === "__none__"),
  ].map(([key, tasks]) => ({
    theme: themes.find(th => th.id === key) ?? null,
    tasks,
  }));
}

function ThemeGroup({ theme, tasks, onEdit, status, cats, statusMeta }) {
  return (
    <div className="theme-group">
      {theme && <div className="theme-group__label"># {theme.name}</div>}
      {tasks.map(task => (
        <ReviewTaskCard key={task.id} task={task} status={status} onEdit={onEdit} cats={cats} statusMeta={statusMeta} />
      ))}
    </div>
  );
}

export default function ReviewView({ tasks, onTaskUpdate }) {
  const currentWeekId = getCurrentWeekId();
  const { themes, loading: themesLoading, addTheme } = useThemes();
  const [editingTask, setEditingTask] = useState(null);
  const { cats } = useCategories();
  const { t, i18n } = useTranslation();
  const locale = i18n.language;

  const STATUS_META = getStatusMeta(t);

  const reviewTasks = [...new Map(
    tasks
      .filter(task => task.week < currentWeekId)
      .map(task => ({ ...task, status: getStatus(task, currentWeekId) }))
      .filter(task => task.status !== null)
      .map(task => [task.id, task])
  ).values()].sort((a, b) => b.week.localeCompare(a.week));

  const uniqueWeeks = [...new Set(reviewTasks.map(task => task.week))]
    .sort((a, b) => b.localeCompare(a));

  const handleSave = useCallback(async (id, updates) => {
    await patchTask(id, updates);
    onTaskUpdate(id, updates);
  }, [onTaskUpdate]);
  handleSave._addTheme = addTheme;

  const missed = reviewTasks.filter(task => task.status === "missed").length;
  const late   = reviewTasks.filter(task => task.status === "late").length;

  const SUMMARY = [
    { label: t("review.summaryMissed"), value: missed,        color: "var(--c-missed)", bg: "var(--c-missed-bg)" },
    { label: t("review.summaryLate"),   value: late,          color: "var(--c-late)",   bg: "var(--c-late-bg)"   },
    { label: t("review.summaryAll"),    value: missed + late, color: "var(--c-accent)", bg: "var(--c-teal-bg)"   },
  ];

  return (
    <div className="review-view">

      <div className="review-summary">
        {SUMMARY.map((c, i) => (
          <div key={i} className="review-sum-card" style={{ background: c.bg }}>
            <div className="review-sum-card__lbl" style={{ color: c.color }}>{c.label}</div>
            <div className="review-sum-card__val" style={{ color: c.color }}>{c.value}</div>
          </div>
        ))}
      </div>

      {reviewTasks.length === 0 && (
        <div className="empty--center">{t("review.allDone")}</div>
      )}

      {uniqueWeeks.map(weekId => {
        const weekMissed = reviewTasks.filter(task => task.week === weekId && task.status === "missed");
        const weekLate   = reviewTasks.filter(task => task.week === weekId && task.status === "late");

        if (themesLoading) return <div className="empty--center">{t("review.loading")}</div>;

        return (
          <div key={weekId} className="review-week-group">
            <div className="review-week-title">
              {weekId} · {formatWeekRange(weekId, locale)}
            </div>

            <div className="review-cols">
              <div>
                <div className="review-col__title review-col__title--missed">
                  {t("review.missedCount", { count: weekMissed.length })}
                </div>
                {weekMissed.length === 0
                  ? <div className="review-col__empty">—</div>
                  : groupByTheme(weekMissed, themes).map(({ theme, tasks }) => (
                      <ThemeGroup key={theme?.id ?? "__none__"} theme={theme} tasks={tasks} onEdit={setEditingTask} status="missed" cats={cats} statusMeta={STATUS_META} />
                    ))
                }
              </div>

              <div>
                <div className="review-col__title review-col__title--late">
                  {t("review.lateCount", { count: weekLate.length })}
                </div>
                {weekLate.length === 0
                  ? <div className="review-col__empty">—</div>
                  : groupByTheme(weekLate, themes).map(({ theme, tasks }) => (
                      <ThemeGroup key={theme?.id ?? "__none__"} theme={theme} tasks={tasks} onEdit={setEditingTask} status="late" cats={cats} statusMeta={STATUS_META} />
                    ))
                }
              </div>
            </div>
          </div>
        );
      })}

      {editingTask && (
        <TaskEditModal
          task={editingTask}
          themes={themes}
          onSave={handleSave}
          onClose={() => setEditingTask(null)}
          cats={cats}
        />
      )}
    </div>
  );
}
