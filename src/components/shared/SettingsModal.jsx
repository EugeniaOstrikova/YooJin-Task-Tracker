import { useState } from "react";
import { useCategories } from "../../context/CategoriesContext";
import { COLORS } from "../../config/colors";
import { btn, input, modal } from "../../config/styles";

function ColorDot({ color }) {
  return (
    <div style={{ width: 18, height: 18, borderRadius: "50%", background: color, flexShrink: 0, border: "1px solid rgba(0,0,0,0.08)" }} />
  );
}

function CategoryRow({ cat, onEdit, onDelete }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${COLORS.border}` }}>
      <ColorDot color={cat.dot} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text.dark }}>{cat.label}</div>
        <div style={{ fontSize: 10, color: COLORS.text.light, fontFamily: "monospace" }}>{cat.dot} · {cat.bg} · {cat.color}</div>
      </div>
      <button onClick={() => onEdit(cat)} style={{ ...btn.ghost, color: COLORS.primary.dark, fontSize: 11 }}>Изменить</button>
      {cat.id !== "other" && (
        <button onClick={() => onDelete(cat.id)} style={{ ...btn.ghost, color: COLORS.missed.text, fontSize: 11 }}>✕</button>
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
    <div style={{ marginBottom: 10 }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: COLORS.text.mid, display: "block", marginBottom: 4 }}>{label}</label>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {(key === "dot" || key === "bg" || key === "color") && <ColorDot color={form[key]} />}
        <input
          value={form[key]}
          onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
          placeholder={placeholder}
          disabled={key === "id" && !isNew}
          style={{ ...input.base, flex: 1, fontFamily: key === "id" ? "monospace" : "inherit" }}
        />
      </div>
    </div>
  );

  return (
    <div style={{ background: COLORS.primary.light, borderRadius: 10, padding: "14px 14px 10px", marginTop: 10 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.primary.dark, marginBottom: 12 }}>
        {isNew ? "Новая категория" : `Редактировать: ${initial.label}`}
      </div>
      {field("id",    "ID (латиница, без пробелов)", "например: study")}
      {field("label", "Название",                    "например: Учёба")}
      {field("dot",   "Цвет точки / бордера (hex)",  "#9B8EC4")}
      {field("bg",    "Цвет фона карточки (hex)",     "#EDE9FE")}
      {field("color", "Цвет текста (hex)",             "#5B21B6")}
      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <button onClick={() => onSave(form)} style={{ ...btn.primary, flex: 1 }}>Сохранить</button>
        <button onClick={onCancel}           style={{ ...btn.secondary }}>Отмена</button>
      </div>
    </div>
  );
}

export default function SettingsModal({ onClose }) {
  const { cats, saveCategory, removeCategory } = useCategories();
  const [editing, setEditing] = useState(null); // null | cat object | "new"
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
    <div style={modal.overlay} onClick={onClose}>
      <div style={{ ...modal.container, maxWidth: 480 }} onClick={e => e.stopPropagation()}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{ fontSize: 17, fontWeight: 700, color: COLORS.text.dark }}>Настройки</span>
          <button onClick={onClose} style={{ ...btn.ghost, fontSize: 16 }}>✕</button>
        </div>

        <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.text.light, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
          Категории
        </div>

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
            style={{ ...btn.secondary, width: "100%", marginTop: 12, textAlign: "center" }}
          >
            + Добавить категорию
          </button>
        )}
      </div>
    </div>
  );
}