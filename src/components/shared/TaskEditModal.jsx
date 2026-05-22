import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useCategories } from "../../context/CategoriesContext";
import { X } from "lucide-react";

export default function TaskEditModal({ task, onSave, onClose }) {
  const { cats } = useCategories();
  const { t } = useTranslation();
  const [form, setForm] = useState({
    text:      task.text      ?? "",
    cat:       task.cat       ?? "other",
    day:       task.day       ?? "",
    duration:  task.duration  ?? "",
    important: task.important ?? false,
    urgent:    task.urgent    ?? false,
    deadline:  task.deadline  ?? false,
  });

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  async function handleSave() {
    await onSave(task.id, {
      ...form,
      duration: form.duration !== "" ? parseFloat(form.duration) : null,
    });
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
          <span className="modal-title">{t("taskEdit.title")}</span>
          <button className="btn-close" onClick={onClose}><X size={15} /></button>
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

        <div className="field">
          <label className="field-label">{t("taskEdit.priorityLabel")}</label>
          <div className="priority-grid">
            {priorities.map(p => (
              <button
                key={`${p.imp}-${p.urg}`}
                className={`priority-btn${form.important === p.imp && form.urgent === p.urg ? " is-active" : ""}`}
                onClick={() => { set("important", p.imp); set("urgent", p.urg); }}
              >
                {t(`taskEdit.${p.key}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="field" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <input
            type="checkbox"
            id="deadline-cb"
            checked={form.deadline}
            onChange={e => set("deadline", e.target.checked)}
            style={{ width: 16, height: 16, accentColor: "var(--c-teal)" }}
          />
          <label htmlFor="deadline-cb" className="field-label" style={{ margin: 0 }}>
            {t("taskEdit.deadlineLabel")}
          </label>
        </div>

        <button className="btn-full btn-full--teal" onClick={handleSave}>
          {t("taskEdit.save")}
        </button>
      </div>
    </div>
  );
}
