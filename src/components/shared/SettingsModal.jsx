import { useState } from "react";
import { useCategories } from "../../context/CategoriesContext";

function ColorDot({ color }) {
  return <div className="color-dot" style={{ background: color }} />;
}

function CategoryRow({ cat, onEdit, onDelete }) {
  return (
    <div className="cat-row">
      <ColorDot color={cat.dot} />
      <div className="cat-row__info">
        <div className="cat-row__label">{cat.label}</div>
        <div className="cat-row__colors">{cat.dot} · {cat.bg} · {cat.color}</div>
      </div>
      <button onClick={() => onEdit(cat)} className="btn-ghost" style={{ color: "var(--c-accent)", fontSize: 11 }}>Изменить</button>
      {cat.id !== "other" && (
        <button onClick={() => onDelete(cat.id)} className="btn-ghost" style={{ color: "var(--c-missed)", fontSize: 11 }}>✕</button>
      )}
    </div>
  );
}

function CategoryForm({ initial, onSave, onCancel }) {
  const isNew = !initial.id;
  const [form, setForm] = useState({
    id:    initial.id    ?? "",
    label: initial.label ?? "",
    dot:   initial.dot   ?? "#94A3B8",
    bg:    initial.bg    ?? "#F1F5F9",
    color: initial.color ?? "#475569",
    sort:  initial.sort  ?? 99,
  });

  const field = (key, label, placeholder) => (
    <div className="field" key={key}>
      <label className="field-label">{label}</label>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {(key === "dot" || key === "bg" || key === "color") && <ColorDot color={form[key]} />}
        <input
          value={form[key]}
          onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
          placeholder={placeholder}
          disabled={key === "id" && !isNew}
          className={`input input--inline${key === "id" ? " input--mono" : ""}`}
        />
      </div>
    </div>
  );

  return (
    <div className="cat-form">
      <div className="cat-form__title">
        {isNew ? "Новая категория" : `Редактировать: ${initial.label}`}
      </div>
      {field("id",    "ID (латиница, без пробелов)", "например: study")}
      {field("label", "Название",                    "например: Учёба")}
      {field("dot",   "Цвет точки / бордера (hex)",  "#9B8EC4")}
      {field("bg",    "Цвет фона карточки (hex)",     "#EDE9FE")}
      {field("color", "Цвет текста (hex)",             "#5B21B6")}
      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <button onClick={() => onSave(form)} className="btn-primary" style={{ flex: 1 }}>Сохранить</button>
        <button onClick={onCancel} className="btn-secondary">Отмена</button>
      </div>
    </div>
  );
}

export default function SettingsModal({ onClose }) {
  const { cats, saveCategory, removeCategory } = useCategories();
  const [editing, setEditing] = useState(null);
  const catList = Object.values(cats).sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));

  async function handleSave(form) {
    await saveCategory(form);
    setEditing(null);
  }

  async function handleDelete(id) {
    if (!confirm(`Удалить категорию «${cats[id]?.label}»?`)) return;
    await removeCategory(id);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>

        <div className="modal-header">
          <span className="modal-title">Настройки</span>
          <button onClick={onClose} className="btn-ghost" style={{ fontSize: 16 }}>✕</button>
        </div>

        <div className="settings-section">Категории</div>

        {catList.map(cat => (
          <CategoryRow key={cat.id} cat={cat} onEdit={setEditing} onDelete={handleDelete} />
        ))}

        {editing && editing !== "new" && (
          <CategoryForm initial={editing} onSave={handleSave} onCancel={() => setEditing(null)} />
        )}
        {editing === "new" && (
          <CategoryForm initial={{}} onSave={handleSave} onCancel={() => setEditing(null)} />
        )}

        {!editing && (
          <button
            onClick={() => setEditing("new")}
            className="btn-secondary"
            style={{ width: "100%", marginTop: 12, textAlign: "center" }}
          >
            + Добавить категорию
          </button>
        )}
      </div>
    </div>
  );
}
