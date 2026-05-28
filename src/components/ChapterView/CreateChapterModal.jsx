import { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { useGoals } from "../../hooks/useGoals";
import {
  getWeeksBetween,
  getNextWeekId,
  formatWeekRange,
  weekIdForDate,
} from "../../lib/weekUtils";

const TACTIC_TYPES = [
  { label: "Сессии + часы", value: "sessions+hours" },
  { label: "Часы", value: "hours" },
  { label: "Количество", value: "count" },
];

function TacticForm({ tactic, onChange, onRemove }) {
  const type = tactic.tactic_type ?? "count";
  //   const type = tactic.target_sessions && tactic.target_hours
  //     ? "sessions+hours"
  //     : tactic.target_hours ? "hours" : "count";

  function handleTypeChange(newType) {
    onChange({
      ...tactic,
      tactic_type: newType,
      target_sessions: null,
      target_hours: null,
      target_count: null,
    });
  }

  return (
    <div
      style={{
        background: "var(--c-bg)",
        borderRadius: "var(--r-md)",
        padding: "10px 12px",
        marginBottom: 8,
      }}
    >
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <input
          className="input"
          style={{ flex: 2 }}
          value={tactic.text}
          onChange={(e) => onChange({ ...tactic, text: e.target.value })}
          placeholder="Название тактики"
        />
        <input
          className="input"
          style={{ flex: 1 }}
          value={tactic.tag}
          onChange={(e) => onChange({ ...tactic, tag: e.target.value })}
          placeholder="tactic_tag"
        />
        <button className="btn-ghost" onClick={onRemove}>
          <Trash2 size={14} />
        </button>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <select
          className="select"
          style={{ flex: 1 }}
          value={type}
          onChange={(e) => handleTypeChange(e.target.value)}
        >
          {TACTIC_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>

        {type === "sessions+hours" && (
          <>
            <input
              className="input"
              style={{ flex: 1 }}
              type="number"
              min="1"
              value={tactic.target_sessions ?? ""}
              onChange={(e) =>
                onChange({
                  ...tactic,
                  target_sessions: parseInt(e.target.value) || null,
                })
              }
              placeholder="сессий"
            />
            <input
              className="input"
              style={{ flex: 1 }}
              type="number"
              min="0.5"
              step="0.5"
              value={tactic.target_hours ?? ""}
              onChange={(e) =>
                onChange({
                  ...tactic,
                  target_hours: parseFloat(e.target.value) || null,
                })
              }
              placeholder="часов"
            />
          </>
        )}

        {type === "hours" && (
          <input
            className="input"
            style={{ flex: 1 }}
            type="number"
            min="0.5"
            step="0.5"
            value={tactic.target_hours ?? ""}
            onChange={(e) =>
              onChange({
                ...tactic,
                target_hours: parseFloat(e.target.value) || null,
              })
            }
            placeholder="часов в неделю"
          />
        )}

        {type === "count" && (
          <input
            className="input"
            style={{ flex: 1 }}
            type="number"
            min="1"
            value={tactic.target_count ?? ""}
            onChange={(e) =>
              onChange({
                ...tactic,
                target_count: parseInt(e.target.value) || null,
              })
            }
            placeholder="раз в неделю"
          />
        )}
      </div>
    </div>
  );
}

export default function CreateChapterModal({ onSave, onClose }) {
  const { goals } = useGoals();
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [startWeek, setStartWeek] = useState("");
  const [duration, setDuration] = useState(12);
  const [targets, setTargets] = useState([
    { id: `t_${Date.now()}`, title: "", life_direction_id: null, tactics: [] },
  ]);

  function addTarget() {
    setTargets((p) => [
      ...p,
      {
        id: `t_${Date.now()}_${p.length}`,
        title: "",
        life_direction_id: null,
        tactics: [],
      },
    ]);
  }

  function removeTarget(i) {
    setTargets((p) => p.filter((_, idx) => idx !== i));
  }

  function updateTarget(i, updates) {
    setTargets((p) =>
      p.map((t, idx) => (idx === i ? { ...t, ...updates } : t))
    );
  }

  function addTactic(targetIdx) {
    const tactic = {
      id: `tac_${Date.now()}`,
      text: "",
      tag: "",
      tactic_type: "count",
      target_sessions: null,
      target_hours: null,
      target_count: null,
    };
    updateTarget(targetIdx, {
      tactics: [...targets[targetIdx].tactics, tactic],
    });
  }

  function updateTactic(targetIdx, tacticIdx, updated) {
    const newTactics = targets[targetIdx].tactics.map((t, i) =>
      i === tacticIdx ? updated : t
    );
    updateTarget(targetIdx, { tactics: newTactics });
  }

  function removeTactic(targetIdx, tacticIdx) {
    const newTactics = targets[targetIdx].tactics.filter(
      (_, i) => i !== tacticIdx
    );
    updateTarget(targetIdx, { tactics: newTactics });
  }

  // Конвертация даты в week ID
  function dateToWeekId(dateStr) {
    if (!dateStr) return "";
    return weekIdForDate(new Date(dateStr));
  }

  async function handleSave() {
    const chapterId = `chapter_${Date.now()}`;
    await onSave({
      chapter: {
        id: chapterId,
        title,
        start_week: startWeek,
        duration_weeks: duration,
      },
      targets: targets.map((t, i) => ({
        id: t.id,
        chapter_id: chapterId,
        title: t.title,
        life_direction_id: t.life_direction_id || null,
        sort: i,
      })),
      tactics: targets.flatMap((t) =>
        t.tactics.map((tac, i) => ({
          ...tac,
          chapter_id: chapterId,
          target_id: t.id,
          sort: i,
        }))
      ),
    });
    onClose();
  }

  const weekPreview = startWeek
    ? `${startWeek} · ${formatWeekRange(startWeek)}`
    : "";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container"
        style={{ maxWidth: 560, maxHeight: "90vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <span className="modal-title">
            {step === 1 ? "Новая глава" : "Ориентиры и тактики"}
          </span>
          <button className="btn-close" onClick={onClose}>
            <X size={15} />
          </button>
        </div>

        {/* Прогресс */}
        <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
          {[1, 2].map((n) => (
            <div
              key={n}
              style={{
                flex: 1,
                height: 3,
                borderRadius: 3,
                background: step >= n ? "var(--c-teal)" : "var(--c-border)",
              }}
            />
          ))}
        </div>

        {/* Шаг 1 */}
        {step === 1 && (
          <>
            <div className="field">
              <label className="field-label">Название главы</label>
              <input
                className="input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Например: Весна 2026"
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
            >
              <div className="field">
                <label className="field-label">Начало (выбери дату)</label>
                <input
                  className="input"
                  type="date"
                  onChange={(e) => {
                    const wId = dateToWeekId(e.target.value);
                    setStartWeek(wId);
                  }}
                />
                {weekPreview && (
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--c-teal)",
                      marginTop: 4,
                    }}
                  >
                    → {weekPreview}
                  </div>
                )}
              </div>

              <div className="field">
                <label className="field-label">Длительность (недель)</label>
                <input
                  className="input"
                  type="number"
                  min="4"
                  max="16"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 12)}
                />
              </div>
            </div>

            <button
              className="btn-full btn-full--teal"
              disabled={!title.trim() || !startWeek}
              onClick={() => setStep(2)}
              style={{ opacity: !title.trim() || !startWeek ? 0.5 : 1 }}
            >
              Далее →
            </button>
          </>
        )}

        {/* Шаг 2 */}
        {step === 2 && (
          <>
            {targets.map((target, ti) => (
              <div
                key={target.id}
                style={{
                  border: "1px solid var(--c-border)",
                  borderRadius: "var(--r-lg)",
                  padding: 14,
                  marginBottom: 12,
                }}
              >
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <input
                    className="input"
                    style={{ flex: 1 }}
                    value={target.title}
                    onChange={(e) =>
                      updateTarget(ti, { title: e.target.value })
                    }
                    placeholder={`Ориентир ${ti + 1}`}
                  />
                  <select
                    className="select"
                    style={{ flex: 1 }}
                    value={target.life_direction_id ?? ""}
                    onChange={(e) =>
                      updateTarget(ti, {
                        life_direction_id: e.target.value || null,
                      })
                    }
                  >
                    <option value="">— без направления —</option>
                    {goals.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.title}
                      </option>
                    ))}
                  </select>
                  {targets.length > 1 && (
                    <button
                      className="btn-ghost"
                      onClick={() => removeTarget(ti)}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--c-dim)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: 6,
                  }}
                >
                  Тактики
                </div>

                {target.tactics.map((tac, taci) => (
                  <TacticForm
                    key={tac.id}
                    tactic={tac}
                    onChange={(updated) => updateTactic(ti, taci, updated)}
                    onRemove={() => removeTactic(ti, taci)}
                  />
                ))}

                <button
                  className="btn-secondary"
                  style={{ width: "100%", fontSize: 12 }}
                  onClick={() => addTactic(ti)}
                >
                  <Plus size={12} /> Добавить тактику
                </button>
              </div>
            ))}

            {targets.length < 3 && (
              <button
                className="btn-secondary"
                style={{ width: "100%", marginBottom: 12 }}
                onClick={addTarget}
              >
                <Plus size={14} /> Добавить ориентир
              </button>
            )}

            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="btn-secondary"
                style={{ flex: 1 }}
                onClick={() => setStep(1)}
              >
                ← Назад
              </button>
              <button
                className="btn-full btn-full--teal"
                style={{ flex: 2, marginTop: 0 }}
                onClick={handleSave}
              >
                Создать главу
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
