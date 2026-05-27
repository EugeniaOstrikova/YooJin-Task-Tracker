import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useCategories } from "../../context/CategoriesContext";
import { X } from "lucide-react";
import Checkbox from "@mui/material/Checkbox";

export default function TaskEditModal({ task = null, defaultDay = "", weekId = "", onSave, onAdd, onClose }) {
  const { cats } = useCategories();
  const isEditing = !!task?.id;
  const { t } = useTranslation();
  const [form, setForm] = useState({
    text:      task?.text      ?? "",
    cat:       task?.cat       ?? "other",
    day:       task?.day       ?? defaultDay,
    duration:  task?.duration  ?? "",
    important: task?.important ?? false,
    urgent:    task?.urgent    ?? false,
    deadline:  task?.deadline  ?? false,
  });

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  async function handleSave() {
    const updates = {
      ...form,
      duration: form.duration !== "" ? parseFloat(form.duration) : null,
    };
    if (isEditing) {
      await onSave(task.id, updates);
    } else {
      await onAdd([{
        id:   `task_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        week: weekId,
        done: false,
        ...updates,
      }]);
    }
    onClose();
  }

  const priorities = [
    { key: "p_high",      imp: true,  urg: true  },
    { key: "p_important", imp: true,  urg: false },
    { key: "p_urgent",    imp: false, urg: true  },
    { key: "p_normal",    imp: false, urg: false },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container task-edit-modal" onClick={e => e.stopPropagation()}>

        <div className="modal-header">
          <span className="modal-title">
            {isEditing ? t("taskEdit.title") : t("taskEdit.createTitle")}
        </span>
          <button className="btn-ghost" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="field task-edit-grid--full">
          <label className="field-label">{t("taskEdit.textLabel")}</label>
          <textarea
            className="textarea"
            rows={2}
            value={form.text}
            onChange={e => set("text", e.target.value)}
          />
        </div>

        <div className="task-edit-grid">
          <div className="field">
            <label className="field-label">{t("taskEdit.categoryLabel")}</label>
            <select className="select" value={form.cat} onChange={e => set("cat", e.target.value)}>
              {Object.entries(cats).map(([id, c]) => (
                <option key={id} value={id}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label className="field-label">{t("taskEdit.dayLabel")}</label>
            <input
              className="input"
              type="date"
              value={form.day}
              onChange={e => set("day", e.target.value)}
            />
          </div>

          <div className="field">
            <label className="field-label">{t("taskEdit.durationLabel")}</label>
            <input
              className="input"
              type="number"
              step="0.5"
              min="0"
              value={form.duration}
              onChange={e => set("duration", e.target.value)}
              placeholder="2"
            />
          </div>
        </div>

        {/* Срочно */}
        <div className="field">
          <label className="field-label">Срочно</label>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
            <input
              type="checkbox"
              id="urgent-cb"
              checked={form.urgent}
              onChange={e => set("urgent", e.target.checked)}
              style={{ width: 16, height: 16, accentColor: "var(--c-priority-urgent)" }}
            />
            <label htmlFor="urgent-cb" style={{ fontSize: 13, color: "var(--c-ink)" }}>
              Критичный дедлайн
            </label>
          </div>
        </div>

        {/* Тип усилия */}
        <div className="field">
          <label className="field-label">Тип задачи</label>
          <div className="priority-grid">
            {[
              { value: null,    label: "Обычная" },
              { value: "heavy", label: "🔥 Тяжёлая" },
              { value: "light", label: "⚡ Лёгкая"  },
            ].map(p => (
              <button
                key={String(p.value)}
                className={`priority-btn${form.effort === p.value ? " is-active" : ""}`}
                onClick={() => set("effort", p.value)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="field" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Checkbox
            checked={form.deadline}
            onChange={e => set("deadline", e.target.checked)}
            size="small"
            id="deadline-cb"
            sx={{
              padding: 0,
              color: "var(--c-border)",
              "&.Mui-checked": { color: "var(--c-accent)" },
            }}
          />
          <label htmlFor="deadline-cb" className="field-label" style={{ margin: 0 }}>
            {t("taskEdit.deadlineLabel")}
          </label>
        </div>

        <button className="btn-full btn-full--teal" onClick={handleSave}>
          {isEditing ? t("taskEdit.save") : t("taskEdit.add")}
        </button>
      </div>
    </div>
  );
}
