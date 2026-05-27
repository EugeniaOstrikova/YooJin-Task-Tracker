import { useState } from "react";
import { useTranslation } from "react-i18next";
import { X, Plus, Trash2 } from "lucide-react";
import { useCategories } from "../../context/CategoriesContext";

const STATUSES = ["Idea","Planning","In Progress","On Hold","Completed","Cancelled"];

export default function CreateGoalModal({ onSave, onClose }) {
  const { t }    = useTranslation();
  const { cats } = useCategories();
  const [step, setStep]   = useState(1);
  const [goal, setGoal]   = useState({
    title: "", motivation: "", success_criteria: "",
    deadline: "", cat: "", status: "Planning",
  });
  const [stages, setStages] = useState([{ title: "" }]);

  const setField = (key, val) => setGoal(p => ({ ...p, [key]: val }));

  function addStage()            { setStages(p => [...p, { title: "" }]); }
  function removeStage(i)        { setStages(p => p.filter((_, idx) => idx !== i)); }
  function setStageTitle(i, val) {
    setStages(p => p.map((s, idx) => idx === i ? { ...s, title: val } : s));
  }

  async function handleSave() {
    const goalId     = `goal_${Date.now()}`;
    const savedGoal  = { id: goalId, ...goal, deadline: goal.deadline || null };
    const savedStages = stages
      .filter(s => s.title.trim())
      .map((s, i) => ({
        id: `stage_${Date.now()}_${i}`,
        goal_id: goalId,
        title: s.title.trim(),
        sort: i,
        status: "Planning",
      }));
    await onSave(savedGoal, savedStages);
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>

        <div className="modal-header">
          <span className="modal-title">
            {step === 1 ? "New Goal" : "Stages"}
          </span>
          <button className="btn-close" onClick={onClose}><X size={15} /></button>
        </div>

        {/* Прогресс шагов */}
        <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
          {[1, 2].map(n => (
            <div key={n} style={{
              flex: 1, height: 3, borderRadius: 3,
              background: step >= n ? "var(--c-teal)" : "var(--c-border)",
              transition: "background 0.2s",
            }} />
          ))}
        </div>

        {/* Шаг 1 */}
        {step === 1 && (
          <>
            <div className="field">
              <label className="field-label">Title *</label>
              <input className="input" value={goal.title}
                onChange={e => setField("title", e.target.value)}
                placeholder="What do I want to achieve?" />
            </div>

            <div className="field">
              <label className="field-label">Motivation — why do I want this?</label>
              <textarea className="textarea" rows={2} value={goal.motivation}
                onChange={e => setField("motivation", e.target.value)}
                placeholder="My deeper reason..." />
            </div>

            <div className="field">
              <label className="field-label">Success criteria — how will I know I achieved it?</label>
              <textarea className="textarea" rows={2} value={goal.success_criteria}
                onChange={e => setField("success_criteria", e.target.value)}
                placeholder="I will know I succeeded when..." />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div className="field">
                <label className="field-label">Deadline</label>
                <input className="input" type="date" value={goal.deadline}
                  onChange={e => setField("deadline", e.target.value)} />
              </div>

              <div className="field">
                <label className="field-label">Category</label>
                <select className="select" value={goal.cat}
                  onChange={e => setField("cat", e.target.value)}>
                  <option value="">— none —</option>
                  {Object.entries(cats).map(([id, c]) => (
                    <option key={id} value={id}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="field">
              <label className="field-label">Status</label>
              <select className="select" value={goal.status}
                onChange={e => setField("status", e.target.value)}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <button
              className="btn-full btn-full--teal"
              onClick={() => goal.title.trim() && setStep(2)}
              style={{ opacity: goal.title.trim() ? 1 : 0.5 }}
            >
              Next →
            </button>
          </>
        )}

        {/* Шаг 2 */}
        {step === 2 && (
          <>
            <p style={{ fontSize: 13, color: "var(--c-mid)", marginBottom: 14 }}>
              Break your goal into stages. You can add tasks to each stage later.
            </p>

            {stages.map((stage, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <input
                  className="input"
                  value={stage.title}
                  onChange={e => setStageTitle(i, e.target.value)}
                  placeholder={`Stage ${i + 1}`}
                />
                {stages.length > 1 && (
                  <button className="btn-ghost" onClick={() => removeStage(i)}>
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}

            <button className="btn-secondary" style={{ width: "100%", marginBottom: 12 }}
              onClick={addStage}>
              <Plus size={14} /> Add stage
            </button>

            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setStep(1)}>
                ← Back
              </button>
              <button className="btn-full btn-full--teal" style={{ flex: 2, marginTop: 0 }}
                onClick={handleSave}>
                Create Goal
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}