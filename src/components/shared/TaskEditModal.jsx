import { useState } from "react";
import { useCategories } from "../../context/CategoriesContext";
import { X } from "lucide-react";

export default function TaskEditModal({ task, onSave, onClose }) {
  const { cats } = useCategories();
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container task-edit-modal" onClick={e => e.stopPropagation()}>

        <div className="modal-header">
          <span className="modal-title">Редактировать задачу</span>
          <button className="btn-close" onClick={onClose}><X size={15} /></button>
        </div>

        {/* Текст */}
        <div className="field task-edit-grid--full">
          <label className="field-label">Текст</label>
          <textarea
            className="textarea"
            rows={2}
            value={form.text}
            onChange={e => set("text", e.target.value)}
          />
        </div>

        <div className="task-edit-grid">
          {/* Категория */}
          <div className="field">
            <label className="field-label">Категория</label>
            <select className="select" value={form.cat} onChange={e => set("cat", e.target.value)}>
              {Object.entries(cats).map(([id, c]) => (
                <option key={id} value={id}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* День */}
          <div className="field">
            <label className="field-label">День (YYYY-MM-DD)</label>
            <input
              className="input"
              type="date"
              value={form.day}
              onChange={e => set("day", e.target.value)}
            />
          </div>

          {/* Длительность */}
          <div className="field">
            <label className="field-label">Длительность (ч)</label>
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

        {/* Приоритет */}
        <div className="field">
          <label className="field-label">Приоритет</label>
          <div className="priority-grid">
            {[
              { label: "🔴 Важно + срочно",    imp: true,  urg: true  },
              { label: "🟡 Важно, не срочно",  imp: true,  urg: false },
              { label: "🟠 Срочно, не важно",  imp: false, urg: true  },
              { label: "⚪ Обычное",            imp: false, urg: false },
            ].map(p => (
              <button
                key={`${p.imp}-${p.urg}`}
                className={`priority-btn${form.important === p.imp && form.urgent === p.urg ? " is-active" : ""}`}
                onClick={() => { set("important", p.imp); set("urgent", p.urg); }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Дедлайн */}
        <div className="field" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <input
            type="checkbox"
            id="deadline-cb"
            checked={form.deadline}
            onChange={e => set("deadline", e.target.checked)}
            style={{ width: 16, height: 16, accentColor: "var(--c-teal)" }}
          />
          <label htmlFor="deadline-cb" className="field-label" style={{ margin: 0 }}>
            Дедлайн
          </label>
        </div>

        <button className="btn-full btn-full--teal" onClick={handleSave}>
          Сохранить
        </button>
      </div>
    </div>
  );
}