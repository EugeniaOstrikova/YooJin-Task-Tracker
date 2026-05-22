import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useCategories } from "../../context/CategoriesContext";
import { isValidWeekId } from "../../lib/weekUtils";
import { X } from "lucide-react";

const EXAMPLE = JSON.stringify([
  {
    id: "task_001",
    week: "2026W20",
    day: "2026-05-12",
    cat: "music",
    text: "Record vocals",
    important: false,
    urgent: false,
    deadline: false,
  },
  {
    id: "task_002",
    week: "2026W20",
    cat: "korea",
    text: "Write to professor",
    important: true,
    urgent: true,
    deadline: false,
  },
], null, 2);

function validate(tasks, CAT_KEYS, t) {
  const errs = [];
  if (!Array.isArray(tasks)) { errs.push(t("import.errRootArray")); return errs; }
  tasks.forEach((task, i) => {
    const n = i + 1;
    if (!task.id)   errs.push(t("import.errMissingId",   { n }));
    if (!task.week) errs.push(t("import.errMissingWeek", { n }));
    else if (!isValidWeekId(task.week)) errs.push(t("import.errInvalidWeek", { n }));
    if (!task.text) errs.push(t("import.errMissingText", { n }));
    if (!task.cat)  errs.push(t("import.errMissingCat",  { n }));
    else if (!CAT_KEYS.includes(task.cat))
      errs.push(t("import.errInvalidCat", { n, cat: task.cat, available: CAT_KEYS.join(", ") }));
    if (task.day && !/^\d{4}-\d{2}-\d{2}$/.test(task.day))
      errs.push(t("import.errInvalidDay", { n }));
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
  const { t } = useTranslation();
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
    catch (e) { setErrors([t("import.errJson", { msg: e.message })]); return; }

    const errs = validate(parsed, CAT_KEYS, t);
    if (errs.length) { setErrors(errs); return; }

    const normalized = parsed.map(task => ({
      important: false, urgent: false, deadline: false, done: false,
      ...task,
    }));

    try {
      if (tab === "restore") await onRestore(normalized);
      else                   await onImport(normalized);
      setSuccess(true);
      setTimeout(() => { setSuccess(false); onClose(); }, 900);
    } catch (e) {
      setErrors([t("import.errSave", { msg: e.message })]);
    }
  }

  return (
    <div className="modal-overlay modal-overlay--bottom" onClick={onClose}>
      <div className="import-sheet" onClick={e => e.stopPropagation()}>

        <div className="modal-header">
          <span className="modal-title">{t("import.title")}</span>
          <button onClick={onClose} className="btn-ghost">
            <X size={16} />
          </button>
        </div>

        <div className="import-tabs">
          <button
            className={`import-tab ${tab === "import" ? "import-tab--on" : "import-tab--off"}`}
            onClick={() => setTab("import")}
          >
            {t("import.tabAdd")}
          </button>
          <button
            className={`import-tab ${tab === "restore" ? "import-tab--on" : "import-tab--off"}`}
            onClick={() => setTab("restore")}
          >
            {t("import.tabRestore")}
          </button>
        </div>

        <p className="import-hint">
          {tab === "import" ? t("import.hintAdd") : t("import.hintRestore")}
        </p>

        <button onClick={() => setShowEx(v => !v)} className="btn-example">
          {showEx ? t("import.hideExample") : t("import.showExample")}
        </button>
        {showEx && <pre className="import-example">{EXAMPLE}</pre>}

        <label className="import-file-label">
          {t("import.loadFile")}
          <input type="file" accept=".json" onChange={handleFile} style={{ display: "block", marginTop: 4, fontSize: 12 }} />
        </label>

        <textarea
          value={json}
          onChange={e => { setJson(e.target.value); setErrors([]); }}
          placeholder={t("import.pastePlaceholder")}
          className={`textarea${errors.length ? " textarea--error" : ""}`}
          style={{ height: 150 }}
        />

        {errors.length > 0 && (
          <div className="alert alert--error">
            {errors.map((e, i) => <div key={i}>• {e}</div>)}
          </div>
        )}

        {success && (
          <div className="alert alert--success">{t("import.success")}</div>
        )}

        <button
          onClick={handleSubmit}
          className={`btn-full ${tab === "restore" ? "btn-full--danger" : "btn-full--dark"}`}
        >
          {tab === "restore" ? t("import.btnReplace") : t("import.btnImport")}
        </button>

        <div className="import-meta">
          <strong>cat:</strong> {CAT_KEYS.join(" · ")}<br />
          <strong>week:</strong> 2026W19, 2026W20, ..., 2027W17<br />
          <strong>important / urgent / deadline:</strong> true | false
        </div>
      </div>
    </div>
  );
}
