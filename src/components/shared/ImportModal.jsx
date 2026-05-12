import { useState } from "react";
import { CATS } from "../../config/categories";
import { isValidWeekId } from "../../lib/weekUtils";

const CAT_KEYS = Object.keys(CATS);

const EXAMPLE = JSON.stringify([
  {
    id: "task_001",
    week: "2026W20",
    day: "2026-05-12",
    cat: "music",
    text: "Записать вокал",
    important: false,
    urgent: false,
    deadline: false,
  },
  {
    id: "task_002",
    week: "2026W20",
    cat: "korea",
    text: "Написать профессору",
    important: true,
    urgent: true,
    deadline: false,
  },
], null, 2);

function validate(tasks) {
  const errs = [];
  if (!Array.isArray(tasks)) { errs.push("Корень должен быть массивом []"); return errs; }
  tasks.forEach((t, i) => {
    const n = i + 1;
    if (!t.id)   errs.push(`#${n}: отсутствует «id»`);
    if (!t.week) errs.push(`#${n}: отсутствует «week»`);
    else if (!isValidWeekId(t.week)) errs.push(`#${n}: неверный формат «week» — ожидается «2026W19»`);
    if (!t.text) errs.push(`#${n}: отсутствует «text»`);
    if (!t.cat)  errs.push(`#${n}: отсутствует «cat»`);
    else if (!CAT_KEYS.includes(t.cat))
      errs.push(`#${n}: неверная «cat» («${t.cat}»). Доступные: ${CAT_KEYS.join(", ")}`);
    if (t.day && !/^\d{4}-\d{2}-\d{2}$/.test(t.day))
      errs.push(`#${n}: «day» должен быть в формате «YYYY-MM-DD»`);
  });
  return errs;
}

export default function ImportModal({ onImport, onRestore, onClose }) {
  const [tab,     setTab]     = useState("import"); // "import" | "restore"
  const [json,    setJson]    = useState("");
  const [errors,  setErrors]  = useState([]);
  const [success, setSuccess] = useState(false);
  const [showEx,  setShowEx]  = useState(false);

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setJson(ev.target.result);
    reader.readAsText(file);
  }

  async function handleSubmit() {
    setErrors([]);
    let parsed;
    try { parsed = JSON.parse(json); }
    catch (e) { setErrors(["Ошибка JSON: " + e.message]); return; }

    const errs = validate(parsed);
    if (errs.length) { setErrors(errs); return; }

    // Добавить defaults
    const normalized = parsed.map(t => ({
      important: false, urgent: false, deadline: false, done: false,
      ...t,
    }));

    try {
      if (tab === "restore") await onRestore(normalized);
      else                   await onImport(normalized);
      setSuccess(true);
      setTimeout(() => { setSuccess(false); onClose(); }, 900);
    } catch (e) {
      setErrors(["Ошибка сохранения: " + e.message]);
    }
  }

  const tabStyle = active => ({
    flex: 1, padding: "7px", fontSize: 13, borderRadius: 8,
    border: "none", fontWeight: 500, cursor: "pointer",
    background: active ? "#0F172A" : "transparent",
    color:      active ? "#fff"    : "#94A3B8",
  });

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 300, backdropFilter: "blur(3px)" }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: "#fff", borderRadius: "20px 20px 0 0", padding: "20px 18px 40px", width: "100%", maxWidth: 580, maxHeight: "90vh", overflowY: "auto" }}
      >
        {/* Заголовок */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{ fontSize: 17, fontWeight: 600, color: "#0F172A" }}>Импорт задач</span>
          <button onClick={onClose} style={{ background: "#F1F5F9", border: "none", borderRadius: 8, width: 30, height: 30, cursor: "pointer", fontSize: 15, color: "#64748B" }}>✕</button>
        </div>

        {/* Табы */}
        <div style={{ display: "flex", background: "#F1F5F9", borderRadius: 10, padding: 4, marginBottom: 14, gap: 4 }}>
          <button style={tabStyle(tab === "import")}  onClick={() => setTab("import")}>Добавить задачи</button>
          <button style={tabStyle(tab === "restore")} onClick={() => setTab("restore")}>Восстановить из файла</button>
        </div>

        <p style={{ fontSize: 12, color: "#64748B", marginBottom: 10, lineHeight: 1.5 }}>
          {tab === "import"
            ? "Добавит задачи к существующим. Задачи с совпадающим id будут обновлены."
            : "⚠️ Полная замена всех задач. Используй для восстановления из сохранённого tasks.json."}
        </p>

        {/* Пример */}
        <button onClick={() => setShowEx(v => !v)} style={{ background: "none", border: "none", color: "#7C3AED", fontSize: 12, cursor: "pointer", padding: 0, marginBottom: 8, fontWeight: 500 }}>
          {showEx ? "▲ Скрыть пример" : "▼ Показать пример JSON"}
        </button>
        {showEx && (
          <pre style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 8, padding: "10px 12px", fontSize: 11, color: "#64748B", fontFamily: "monospace", whiteSpace: "pre-wrap", lineHeight: 1.6, marginBottom: 10 }}>
            {EXAMPLE}
          </pre>
        )}

        {/* Загрузить файл */}
        <label style={{ display: "block", marginBottom: 8, fontSize: 12, color: "#64748B" }}>
          Загрузить .json файл:
          <input type="file" accept=".json" onChange={handleFile} style={{ display: "block", marginTop: 4, fontSize: 12 }} />
        </label>

        {/* Или вставить текстом */}
        <textarea
          value={json}
          onChange={e => { setJson(e.target.value); setErrors([]); }}
          placeholder="...или вставь JSON сюда"
          style={{ width: "100%", height: 150, borderRadius: 10, border: errors.length ? "1.5px solid #FCA5A5" : "1px solid #E2E8F0", padding: "10px 12px", fontSize: 12, fontFamily: "monospace", resize: "vertical", outline: "none", boxSizing: "border-box", color: "#0F172A", lineHeight: 1.6 }}
        />

        {/* Ошибки */}
        {errors.length > 0 && (
          <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "10px 12px", marginTop: 8, fontSize: 12, color: "#DC2626", lineHeight: 1.7 }}>
            {errors.map((e, i) => <div key={i}>• {e}</div>)}
          </div>
        )}

        {success && (
          <div style={{ background: "#F0FDF4", border: "1px solid #86EFAC", borderRadius: 8, padding: "10px 12px", marginTop: 8, fontSize: 13, color: "#16A34A", fontWeight: 500 }}>
            ✓ Готово!
          </div>
        )}

        <button onClick={handleSubmit} style={{ marginTop: 12, width: "100%", padding: 13, borderRadius: 12, background: tab === "restore" ? "#DC2626" : "#0F172A", color: "#fff", fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer" }}>
          {tab === "restore" ? "Заменить все задачи" : "Импортировать"}
        </button>

        {/* Подсказка по категориям */}
        <div style={{ marginTop: 12, fontSize: 11, color: "#94A3B8", lineHeight: 1.7 }}>
          <strong>cat:</strong> {CAT_KEYS.join(" · ")}<br />
          <strong>week:</strong> 2026W19, 2026W20, ..., 2027W17<br />
          <strong>important / urgent / deadline:</strong> true | false (по умолч. false)
        </div>
      </div>
    </div>
  );
}
