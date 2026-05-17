import { useState, useCallback } from "react";
import { useCategories } from "../../context/CategoriesContext";
import { useThemes } from "../../hooks/useThemes";
import { patchTask } from "../../lib/storage";
import { getCurrentWeekId, weekIdForDate, formatWeekRange } from "../../lib/weekUtils";
import { COLORS } from "../../config/colors";
import { card, btn, badge, modal, sectionTitle, input } from "../../config/styles";
import { MessageCircle } from "lucide-react";

// ── Логика статуса ────────────────────────────────────

function isLate(task) {
  if (!task.done || !task.completed_at) return false;
  const completedDate = new Date(task.completed_at);
  if (task.day) {
    return completedDate.toISOString().split("T")[0] > task.day;
  }
  return weekIdForDate(completedDate) !== task.week;
}

function getStatus(task, currentWeekId) {
  if (!task.done && task.week < currentWeekId) return "missed";
  if (task.done && isLate(task))              return "late";
  return null;
}

const STATUS_META = {
  missed: { label: "Пропущена",           color: "#C0614F", bg: "#FAE8E5" },
  late:   { label: "Выполнена с опозданием", color: "#A07C2A", bg: "#FEF9EC" },
};

// ── Модалка редактирования задачи ─────────────────────

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
    <div
      style={modal.overlay}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={modal.container}
      >
        {/* Заголовок */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#0F172A", marginBottom: 6 }}>{task.text}</div>
            <div style={{ display: "flex", gap: 8 }}>
              <span style={{ fontSize: 11, background: STATUS_META[status].bg, color: STATUS_META[status].color, borderRadius: 20, padding: "2px 9px", fontWeight: 600 }}>
                {STATUS_META[status].label}
              </span>
              <span style={{ fontSize: 11, background: cats[task.cat]?.bg ?? "#F1F5F9", color: cats[task.cat]?.text ?? "#64748B", borderRadius: 20, padding: "2px 9px", fontWeight: 600 }}>
                {cats[task.cat]?.label ?? task.cat}
              </span>
            </div>
          </div>
          <button onClick={onClose} style={btn.primary}>✕</button>
        </div>

        {/* Тема */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#64748B", display: "block", marginBottom: 6 }}>Суть задачи (тема)</label>
          <select
            value={themeId}
            onChange={e => setThemeId(e.target.value)}
            style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 13, color: "#0F172A", outline: "none", marginBottom: 8 }}
          >
            <option value="">— без темы —</option>
            {themes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={newTheme}
              onChange={e => setNewTheme(e.target.value)}
              placeholder="Создать новую тему..."
              style={{ flex: 1, padding: "7px 12px", borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 13, outline: "none" }}
            />
            <button
              onClick={async () => {
                if (!newTheme.trim()) return;
                const t = await onSave._addTheme(newTheme);
                if (t) { setThemeId(t.id); setNewTheme(""); }
              }}
              style={{ background: "#2C5F6A", color: "#fff", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 13, cursor: "pointer" }}
            >
              + Добавить
            </button>
          </div>
        </div>

        {/* Заметка */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#64748B", display: "block", marginBottom: 6 }}>Заметка — почему не выполнена?</label>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Что помешало? Как скорректировать план?"
            rows={3}
            style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box", lineHeight: 1.5 }}
          />
        </div>

        <button
          onClick={handleSave}
          style={{ width: "100%", padding: 13, borderRadius: 12, background: "#2C5F6A", color: "#fff", fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer" }}
        >
          Сохранить
        </button>
      </div>
    </div>
  );
}

// ── Карточка задачи в review ──────────────────────────

function ReviewTaskCard({ task, status, onEdit, cats }) {
  const cat = cats[task.cat];
  const s   = STATUS_META[status];
  return (
    <div
      onClick={() => onEdit(task)}
      style={{
        display:      "flex",
        alignItems:   "flex-start",
        gap:          10,
        padding:      "8px 12px",
        borderRadius: 8,
        marginBottom: 3,
        cursor:       "pointer",
        // background:   s.bg,
        background: `linear-gradient(to left, ${s.bg}, transparent)`,
        border:  `1px solid ${s.color}`,
        borderRight:  `3px solid ${s.color}`,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: "#0F172A", lineHeight: 1.4 }}>{task.text}</div>
        <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
          {cat && (
            <span style={{ fontSize: 10, background: cat.bg, color: cat.text, borderRadius: 20, padding: "1px 7px", fontWeight: 600 }}>
              {cat.label}
            </span>
          )}
          {task.note && (
            <span style={{ fontSize: 10, color: "#94A3B8", fontStyle: "italic" }}>
                <MessageCircle size={12} /> есть заметка
            </span>
          )}
        </div>
      </div>
      <span style={{ fontSize: 11, color: s.color, flexShrink: 0 }}>→</span>
    </div>
  );
}

function groupByTheme(tasks, themes) {
  const map = {};
  tasks.forEach(task => {
    const key = task.theme_id ?? "__none__";
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
    <div style={{ marginBottom: 10 }}>
      {theme && (
        <div style={{ fontSize: 10, fontWeight: 700, color: COLORS.primary.base, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4, paddingLeft: 2 }}>
          # {theme.name}
        </div>
      )}
      {tasks.map(task => (
        <ReviewTaskCard key={task.id} task={task} status={status} onEdit={onEdit} cats={cats} />
      ))}
    </div>
  );
}

// ── Главный компонент ─────────────────────────────────

export default function ReviewView({ tasks, onTaskUpdate }) {
  const currentWeekId   = getCurrentWeekId();
  const { themes, addTheme } = useThemes();
  const [editingTask,   setEditingTask]   = useState(null);
  const { cats } = useCategories();

  // Задачи для review
  const reviewTasks = tasks
    .filter(t => t.week < currentWeekId)
    .map(t => ({ ...t, status: getStatus(t, currentWeekId) }))
    .filter(t => t.status !== null)
    .sort((a, b) => b.week.localeCompare(a.week));

  // Группировка по неделям → темам
  const grouped = {};
  reviewTasks.forEach(task => {
    if (!grouped[task.week]) grouped[task.week] = {};
    const themeKey = task.theme_id ?? "__none__";
    if (!grouped[task.week][themeKey]) grouped[task.week][themeKey] = [];
    grouped[task.week][themeKey].push(task);
  });

  const handleSave = useCallback(async (id, updates) => {
    await patchTask(id, updates);
    onTaskUpdate(id, updates);
  }, [onTaskUpdate]);

  handleSave._addTheme = addTheme;

  const missed = reviewTasks.filter(t => t.status === "missed").length;
  const late   = reviewTasks.filter(t => t.status === "late").length;

  return (
    <div style={{ padding: "16px 20px 40px", maxWidth: 800, margin: "0 auto" }}>

      {/* Итоги */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {[
          { label: "Пропущено задач",             value: missed, color: "#C0614F", bg: "#FAE8E5" },
          { label: "Выполнено с опозданием",       value: late,   color: "#A07C2A", bg: "#FEF9EC" },
          { label: "Всего требуют внимания",        value: missed + late, color: "#2C5F6A", bg: "#EAF3F5" },
        ].map((c, i) => (
          <div key={i} style={{ background: c.bg, borderRadius: 12, padding: "12px 18px", flex: 1 }}>
            <div style={{ fontSize: 11, color: c.color, marginBottom: 4 }}>{c.label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: c.color }}>{c.value}</div>
          </div>
        ))}
      </div>

      {reviewTasks.length === 0 && (
        <div style={{ textAlign: "center", color: "#CBD5E1", fontSize: 14, marginTop: 60 }}>
          Всё выполнено вовремя 🎉
        </div>
      )}

      {/* Группы по неделям */}
      {Object.entries(grouped).map(([weekId, themeGroups]) => {
        const weekMissed = Object.values(themeGroups).flat().filter(t => t.status === "missed");
        const weekLate   = Object.values(themeGroups).flat().filter(t => t.status === "late");

        return (
            <div key={weekId} style={{ marginBottom: 28 }}>
            {/* Заголовок недели */}
            <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.primary.dark, marginBottom: 12 }}>
                {weekId} · {formatWeekRange(weekId)}
            </div>

            {/* Две колонки */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>

                {/* Пропущенные */}
                <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.missed.text, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                    Не выполнены · {weekMissed.length}
                </div>
                {weekMissed.length === 0
                    ? <div style={{ fontSize: 12, color: COLORS.text.faint, fontStyle: "italic" }}>—</div>
                    : groupByTheme(weekMissed, themes).map(({ theme, tasks }) => (
                        <ThemeGroup key={theme?.id ?? "__none__"} theme={theme} tasks={tasks} onEdit={setEditingTask} status="missed" cats={cats} />
                    ))
                }
                </div>

                {/* Опоздания */}
                <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.late.text, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                    Выполнены позже · {weekLate.length}
                </div>
                {weekLate.length === 0
                    ? <div style={{ fontSize: 12, color: COLORS.text.faint, fontStyle: "italic" }}>—</div>
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