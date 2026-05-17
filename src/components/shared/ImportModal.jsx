import { useState } from "react";
import { useCategories } from "../../context/CategoriesContext";
import { isValidWeekId } from "../../lib/weekUtils";

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

function validate(tasks, CAT_KEYS) {
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
  const [tab,     setTab]     = useState("import");
  const [json,    setJson]    = useState("");
  const [errors,  setErrors]  = useState([]);
  const [success, setSuccess] = useState(false);
  const [showEx,  setShowEx]  = useState(false);
  const { cats } = useCategories();
  const CAT_KEYS = Object.keys(cats);

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

    const errs = validate(parsed, CAT_KEYS);
    if (errs.length) { setErrors(errs); return; }

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

  return (
    <div className="modal-overlay modal-overlay--bottom" onClick={onClose}>
      <div className="import-sheet" onClick={e => e.stopPropagation()}>

        <div className="modal-header">
          <span className="modal-title">Импорт задач</span>
          <button onClick={onClose} className="btn-close">✕</button>
        </div>

        <div className="import-tabs">
          <button
            className={`import-tab ${tab === "import" ? "import-tab--on" : "import-tab--off"}`}
            onClick={() => setTab("import")}
          >
            Добавить задачи
          </button>
          <button
            className={`import-tab ${tab === "restore" ? "import-tab--on" : "import-tab--off"}`}
            onClick={() => setTab("restore")}
          >
            Восстановить из файла
          </button>
        </div>

        <p className="import-hint">
          {tab === "import"
            ? "Добавит задачи к существующим. Задачи с совпадающим id будут обновлены."
            : "⚠️ Полная замена всех задач. Используй для восстановления из сохранённого tasks.json."}
        </p>

        <button onClick={() => setShowEx(v => !v)} className="btn-example">
          {showEx ? "▲ Скрыть пример" : "▼ Показать пример JSON"}
        </button>
        {showEx && <pre className="import-example">{EXAMPLE}</pre>}

        <label className="import-file-label">
          Загрузить .json файл:
          <input type="file" accept=".json" onChange={handleFile} style={{ display: "block", marginTop: 4, fontSize: 12 }} />
        </label>

        <textarea
          value={json}
          onChange={e => { setJson(e.target.value); setErrors([]); }}
          placeholder="...или вставь JSON сюда"
          className={`textarea${errors.length ? " textarea--error" : ""}`}
          style={{ height: 150 }}
        />

        {errors.length > 0 && (
          <div className="alert alert--error">
            {errors.map((e, i) => <div key={i}>• {e}</div>)}
          </div>
        )}

        {success && (
          <div className="alert alert--success">✓ Готово!</div>
        )}

        <button
          onClick={handleSubmit}
          className={`btn-full ${tab === "restore" ? "btn-full--danger" : "btn-full--dark"}`}
        >
          {tab === "restore" ? "Заменить все задачи" : "Импортировать"}
        </button>

        <div className="import-meta">
          <strong>cat:</strong> {CAT_KEYS.join(" · ")}<br />
          <strong>week:</strong> 2026W19, 2026W20, ..., 2027W17<br />
          <strong>important / urgent / deadline:</strong> true | false (по умолч. false)
        </div>
      </div>
    </div>
  );
}
