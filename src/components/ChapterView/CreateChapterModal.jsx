import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Trash2 } from "lucide-react";
import { useGoals } from "../../hooks/useGoals";
import { formatWeekRange, weekIdForDate } from "../../lib/weekUtils";
import Modal from "../shared/Modal";
import TacticsEditor from "./TacticsEditor";

export default function CreateChapterModal({ onSave, onClose }) {
  const { t } = useTranslation();
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
      { id: `t_${Date.now()}_${p.length}`, title: "", life_direction_id: null, tactics: [] },
    ]);
  }

  function removeTarget(i) {
    setTargets((p) => p.filter((_, idx) => idx !== i));
  }

  function updateTarget(i, updates) {
    setTargets((p) => p.map((tg, idx) => (idx === i ? { ...tg, ...updates } : tg)));
  }

  function addTactic(targetIdx) {
    updateTarget(targetIdx, {
      tactics: [
        ...targets[targetIdx].tactics,
        {
          id: `tac_${Date.now()}`,
          text: "",
          tag: "",
          tactic_type: "count",
          target_sessions: null,
          target_hours: null,
          target_count: null,
        },
      ],
    });
  }

  function updateTactic(targetIdx, tacticIdx, updated) {
    updateTarget(targetIdx, {
      tactics: targets[targetIdx].tactics.map((tac, i) => (i === tacticIdx ? updated : tac)),
    });
  }

  function removeTactic(targetIdx, tacticIdx) {
    updateTarget(targetIdx, {
      tactics: targets[targetIdx].tactics.filter((_, i) => i !== tacticIdx),
    });
  }

  function dateToWeekId(dateStr) {
    if (!dateStr) return "";
    return weekIdForDate(new Date(dateStr));
  }

  async function handleSave() {
    const chapterId = `chapter_${Date.now()}`;
    await onSave({
      chapter: { id: chapterId, title, start_week: startWeek, duration_weeks: duration },
      targets: targets.map((tg, i) => ({
        id: tg.id,
        chapter_id: chapterId,
        title: tg.title,
        life_direction_id: tg.life_direction_id || null,
        sort: i,
      })),
      tactics: targets.flatMap((tg) =>
        tg.tactics.map((tac, i) => ({
          ...tac,
          chapter_id: chapterId,
          target_id: tg.id,
          sort: i,
        }))
      ),
    });
    onClose();
  }

  const weekPreview = startWeek ? `${startWeek} · ${formatWeekRange(startWeek)}` : "";

  return (
    <Modal
      title={step === 1 ? t("chapter.create.titleStep1") : t("chapter.create.titleStep2")}
      onClose={onClose}
      maxWidth={560}
      style={{ maxHeight: "90vh", overflowY: "auto" }}
    >
      <div className="chapter-modal__steps">
        {[1, 2].map((n) => (
          <div
            key={n}
            className={`chapter-modal__step${step >= n ? " chapter-modal__step--active" : ""}`}
          />
        ))}
      </div>

      {step === 1 && (
        <>
          <div className="field">
            <label className="field-label">{t("chapter.create.fieldTitle")}</label>
            <input
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("chapter.create.fieldTitlePlaceholder")}
            />
          </div>

          <div className="chapter-modal__grid-2">
            <div className="field">
              <label className="field-label">{t("chapter.create.fieldStart")}</label>
              <input
                className="input"
                type="date"
                onChange={(e) => setStartWeek(dateToWeekId(e.target.value))}
              />
              {weekPreview && (
                <div className="chapter-modal__week-preview">→ {weekPreview}</div>
              )}
            </div>

            <div className="field">
              <label className="field-label">{t("chapter.create.fieldDuration")}</label>
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
            {t("chapter.create.nextBtn")}
          </button>
        </>
      )}

      {step === 2 && (
        <>
          {targets.map((target, ti) => (
            <div key={target.id} className="card-light chapter-modal__target-block">
              <div className="chapter-modal__target-row">
                <input
                  className="input"
                  style={{ flex: 1 }}
                  value={target.title}
                  onChange={(e) => updateTarget(ti, { title: e.target.value })}
                  placeholder={t("chapter.create.targetPlaceholder", { num: ti + 1 })}
                />
                <select
                  className="select"
                  style={{ flex: 1 }}
                  value={target.life_direction_id ?? ""}
                  onChange={(e) =>
                    updateTarget(ti, { life_direction_id: e.target.value || null })
                  }
                >
                  <option value="">{t("chapter.target.noDirection")}</option>
                  {goals.map((g) => (
                    <option key={g.id} value={g.id}>{g.title}</option>
                  ))}
                </select>
                {targets.length > 1 && (
                  <button className="btn-ghost" onClick={() => removeTarget(ti)}>
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              <TacticsEditor
                tactics={target.tactics}
                onAdd={() => addTactic(ti)}
                onChange={(j, updated) => updateTactic(ti, j, updated)}
                onRemove={(j) => removeTactic(ti, j)}
              />
            </div>
          ))}

          {targets.length < 3 && (
            <button
              className="btn-secondary btn--icon"
              style={{ width: "100%", marginBottom: 12 }}
              onClick={addTarget}
            >
              <Plus size={14} /> {t("chapter.create.addTargetBtn")}
            </button>
          )}

          <div className="chapter-modal__footer">
            <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setStep(1)}>
              {t("chapter.create.backBtn")}
            </button>
            <button
              className="btn-full btn-full--teal"
              style={{ flex: 2, marginTop: 0 }}
              onClick={handleSave}
            >
              {t("chapter.create.createBtn")}
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}
