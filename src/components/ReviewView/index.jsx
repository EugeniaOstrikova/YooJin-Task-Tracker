import { useState, useCallback } from "react";
import { useCategories } from "../../context/CategoriesContext";
import { useThemes } from "../../hooks/useThemes";
import { patchTask } from "../../lib/storage";
import { getCurrentWeekId, weekIdForDate, formatWeekRange } from "../../lib/weekUtils";
import { MessageCircle } from "lucide-react";

// ── Логика статуса ─────────────────────────

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

const STATUS_META = {
  missed: { label: "Пропущена",              color: "var(--c-missed)", bg: "var(--c-missed-bg)" },
  late:   { label: "Выполнена с опозданием", color: "var(--c-late)",   bg: "var(--c-late-bg)"   },
};

// ── Модалка редактирования задачи ──────────

function TaskEditModal({ task, themes, onSave, onClose, cats }) {
  const [themeId,  setThemeId]  = useState(task.theme_id ?? "");
  const [note,     setNote]     = useState(task.note ?? "");
  const [newTheme, setNewTheme] = useState("");
  const status = getStatus(task, getCurrentWeekId());

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
          <button onClick={onClose} className="btn-primary">✕</button>
        </div>

        {/* Тема */}
        <div className="task-edit-section">
          <label className="task-edit-label">Суть задачи (тема)</label>
          <select
            value={themeId}
            onChange={e => setThemeId(e.target.value)}
            className="select"
            style={{ marginBottom: 8 }}
          >
            <option value="">— без темы —</option>
            {themes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <div className="task-edit-row">
            <input
              value={newTheme}
              onChange={e => setNewTheme(e.target.value)}
              placeholder="Создать новую тему..."
              className="input input--inline"
            />
            <button
              onClick={async () => {
                if (!newTheme.trim()) return;
                const t = await onSave._addTheme(newTheme);
                if (t) { setThemeId(t.id); setNewTheme(""); }
              }}
              className="btn-add-theme"
            >
              + Добавить
            </button>
          </div>
        </div>

        {/* Заметка */}
        <div className="task-edit-section">
          <label className="task-edit-label">Заметка — почему не выполнена?</label>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Что помешало? Как скорректировать план?"
            rows={3}
            className="textarea"
          />
        </div>

        <button onClick={handleSave} className="btn-full btn-full--teal">
          Сохранить
        </button>
      </div>
    </div>
  );
}

// ── Карточка задачи в review ───────────────

function ReviewTaskCard({ task, status, onEdit, cats }) {
  const cat = cats[task.cat];
  const s   = STATUS_META[status];
  return (
    <div
      onClick={() => onEdit(task)}
      className="review-task"
      style={{
        background:  `linear-gradient(to left, ${s.bg}, transparent)`,
        border:      `1px solid ${s.color}`,
        borderRight: `3px solid ${s.color}`,
      }}
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
              <MessageCircle size={12} /> есть заметка
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
    // Используем theme_id как ключ только если тема реально найдена
    const found = themes.find(t => t.id === task.theme_id);
    const key = found ? task.theme_id : "__none__";
    if (!map[key]) map[key] = [];
    map[key].push(task);
  });

  return [
    ...Object.entries(map).filter(([k]) => k !== "__none__"),
    ...Object.entries(map).filter(([k]) => k === "__none__"),
  ].map(([key, tasks]) => ({
    theme: themes.find(t => t.id === key) ?? null,
    tasks,
  }));
}

function ThemeGroup({ theme, tasks, onEdit, status, cats }) {
  return (
    <div className="theme-group">
      {theme && <div className="theme-group__label"># {theme.name}</div>}
      {tasks.map(task => (
        <ReviewTaskCard key={task.id} task={task} status={status} onEdit={onEdit} cats={cats} />
      ))}
    </div>
  );
}

// ── Главный компонент ──────────────────────

export default function ReviewView({ tasks, onTaskUpdate }) {
  const currentWeekId = getCurrentWeekId();
  const { themes, addTheme } = useThemes();
  const [editingTask, setEditingTask] = useState(null);
  const { cats } = useCategories();

  const reviewTasks = [...new Map(
    tasks
      .filter(t => t.week < currentWeekId)
      .map(t => ({ ...t, status: getStatus(t, currentWeekId) }))
      .filter(t => t.status !== null)
      .map(t => [t.id, t])
  ).values()].sort((a, b) => b.week.localeCompare(a.week));
  console.log("reviewTasks ids:", reviewTasks.map(t => t.id));
console.log("weekMissed для W20:", reviewTasks.filter(t => t.week === "2026W20" && t.status === "missed").map(t => ({ id: t.id, text: t.text, theme_id: t.theme_id })));

  const uniqueWeeks = [...new Set(reviewTasks.map(t => t.week))]
    .sort((a, b) => b.localeCompare(a));

  const handleSave = useCallback(async (id, updates) => {
    await patchTask(id, updates);
    onTaskUpdate(id, updates);
  }, [onTaskUpdate]);
  handleSave._addTheme = addTheme;

  const missed = reviewTasks.filter(t => t.status === "missed").length;
  const late   = reviewTasks.filter(t => t.status === "late").length;

  const SUMMARY = [
    { label: "Пропущено задач",          value: missed,        color: "var(--c-missed)", bg: "var(--c-missed-bg)" },
    { label: "Выполнено с опозданием",   value: late,          color: "var(--c-late)",   bg: "var(--c-late-bg)"   },
    { label: "Всего требуют внимания",   value: missed + late, color: "var(--c-accent)", bg: "var(--c-teal-bg)"   },
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
        <div className="empty--center">Всё выполнено вовремя 🎉</div>
      )}

      {uniqueWeeks.map(weekId => {
        const weekMissed = reviewTasks.filter(t => t.week === weekId && t.status === "missed");
        const weekLate   = reviewTasks.filter(t => t.week === weekId && t.status === "late");
        const { themes, loading: themesLoading, addTheme } = useThemes();

        if (themesLoading) return <div className="empty--center">Загрузка...</div>;

        return (
          <div key={weekId} className="review-week-group">
            <div className="review-week-title">
              {weekId} · {formatWeekRange(weekId)}
            </div>

            <div className="review-cols">
              <div>
                <div className="review-col__title review-col__title--missed">
                  Не выполнены · {weekMissed.length}
                </div>
                {weekMissed.length === 0
                  ? <div className="review-col__empty">—</div>
                  : groupByTheme(weekMissed, themes).map(({ theme, tasks }) => (
                      <ThemeGroup key={theme?.id ?? "__none__"} theme={theme} tasks={tasks} onEdit={setEditingTask} status="missed" cats={cats} />
                    ))
                }
              </div>

              <div>
                <div className="review-col__title review-col__title--late">
                  Выполнены позже · {weekLate.length}
                </div>
                {weekLate.length === 0
                  ? <div className="review-col__empty">—</div>
                  : groupByTheme(weekLate, themes).map(({ theme, tasks }) => (
                      <ThemeGroup key={theme?.id ?? "__none__"} theme={theme} tasks={tasks} onEdit={setEditingTask} status="late" cats={cats} />
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
