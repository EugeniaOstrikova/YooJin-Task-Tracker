import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Trash2 } from "lucide-react";
import Modal from "../shared/Modal";
import TacticsEditor from "./TacticsEditor";
import { weekIdForDate, getWeekStart } from "../../lib/weekUtils";

export default function TargetModal({
  target,
  tactics,
  checkpoints,
  goals,
  chapterId,
  isNew,
  onSaveTarget,
  onSaveTactic,
  onRemoveTactic,
  onSaveCheckpoint,
  onRemoveCheckpoint,
  onClose,
}) {
  const { t } = useTranslation();
  const [form, setForm] = useState(target);
  const [localTactics, setLocalTactics] = useState(tactics);
  const [removedTacticIds] = useState(() => new Set());
  const [localCheckpoints, setLocalCheckpoints] = useState(checkpoints);
  const [removedCheckpointIds] = useState(() => new Set());

  function addTactic() {
    setLocalTactics((p) => [
      ...p,
      {
        id: `tactic_new_${Date.now()}`,
        chapter_id: chapterId,
        target_id: target.id,
        text: "",
        tag: "",
        tactic_type: "count",
        target_sessions: null,
        target_hours: null,
        target_count: null,
        sort: p.length,
      },
    ]);
  }

  function updateTactic(idx, updated) {
    setLocalTactics((p) => p.map((t, i) => (i === idx ? updated : t)));
  }

  function removeTactic(idx) {
    const tactic = localTactics[idx];
    if (!tactic.id.startsWith("tactic_new_")) removedTacticIds.add(tactic.id);
    setLocalTactics((p) => p.filter((_, i) => i !== idx));
  }

  function addCheckpoint() {
    setLocalCheckpoints((p) => [
      ...p,
      {
        id: `cp_new_${Date.now()}`,
        chapter_id: chapterId,
        target_id: target.id,
        title: "",
        target_week: null,
        done: false,
      },
    ]);
  }

  function updateCheckpoint(idx, updated) {
    setLocalCheckpoints((p) => p.map((c, i) => (i === idx ? updated : c)));
  }

  function removeCheckpoint(idx) {
    const cp = localCheckpoints[idx];
    if (!cp.id.startsWith("cp_new_")) removedCheckpointIds.add(cp.id);
    setLocalCheckpoints((p) => p.filter((_, i) => i !== idx));
  }

  async function handleSave() {
    await onSaveTarget(form);
    for (const id of removedTacticIds) await onRemoveTactic(id);
    for (const tactic of localTactics) await onSaveTactic(tactic);
    for (const id of removedCheckpointIds) await onRemoveCheckpoint(id);
    for (const cp of localCheckpoints) await onSaveCheckpoint(cp);
    onClose();
  }

  return (
    <Modal
      title={isNew ? t("chapter.target.newTitle") : t("chapter.target.editTitle")}
      onClose={onClose}
      maxWidth={560}
      style={{ maxHeight: "85vh", overflowY: "auto" }}
    >
      <div className="field">
        <label className="field-label">{t("chapter.target.fieldName")}</label>
        <input
          className="input"
          value={form.title}
          autoFocus
          onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          placeholder={t("chapter.target.fieldNamePlaceholder")}
        />
      </div>

      <div className="field">
        <label className="field-label">{t("chapter.target.fieldDirection")}</label>
        <select
          className="select"
          value={form.life_direction_id ?? ""}
          onChange={(e) =>
            setForm((p) => ({ ...p, life_direction_id: e.target.value || null }))
          }
        >
          <option value="">{t("chapter.target.noDirection")}</option>
          {goals.map((g) => (
            <option key={g.id} value={g.id}>{g.title}</option>
          ))}
        </select>
      </div>

      <div className="modal-section--spaced">
        <TacticsEditor
          tactics={localTactics}
          onAdd={addTactic}
          onChange={updateTactic}
          onRemove={removeTactic}
        />
      </div>

      <div className="modal-section">
        <div className="section-title section-title--dim">
          {t("chapter.target.sectionCheckpoints")}
        </div>

        {localCheckpoints.map((cp, i) => (
          <div key={cp.id} className="checkpoint-row">
            <input
              className="input"
              style={{ flex: 2 }}
              value={cp.title}
              onChange={(e) => updateCheckpoint(i, { ...cp, title: e.target.value })}
              placeholder={t("chapter.target.checkpointPlaceholder")}
            />
            <input
              className="input"
              style={{ flex: 1 }}
              type="date"
              value={
                cp.target_week
                  ? getWeekStart(cp.target_week).toISOString().slice(0, 10)
                  : ""
              }
              onChange={(e) =>
                updateCheckpoint(i, {
                  ...cp,
                  target_week: e.target.value
                    ? weekIdForDate(new Date(e.target.value))
                    : null,
                })
              }
            />
            <button className="btn-ghost" onClick={() => removeCheckpoint(i)}>
              <Trash2 size={14} />
            </button>
          </div>
        ))}

        <button
          className="btn-secondary btn--icon"
          style={{ width: "100%", fontSize: 12 }}
          onClick={addCheckpoint}
        >
          <Plus size={12} /> {t("chapter.target.addCheckpoint")}
        </button>
      </div>

      <button className="btn-full btn-full--teal" onClick={handleSave}>
        {isNew ? t("chapter.target.addBtn") : t("chapter.target.saveBtn")}
      </button>
    </Modal>
  );
}
