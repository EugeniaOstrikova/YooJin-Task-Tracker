import { useTranslation } from "react-i18next";
import { Trash2 } from "lucide-react";

const TYPES = (t) => [
  { value: "sessions+hours", label: t("chapter.tactic.type_sessions_hours") },
  { value: "hours", label: t("chapter.tactic.type_hours") },
  { value: "count", label: t("chapter.tactic.type_count") },
];

export default function TacticForm({ tactic, onChange, onRemove }) {
  const { t } = useTranslation();
  const type = tactic.tactic_type ?? "count";

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
    <div className="tactic-form">
      <div className="tactic-form__row">
        <input
          className="input"
          style={{ flex: 2 }}
          value={tactic.text}
          onChange={(e) => onChange({ ...tactic, text: e.target.value })}
          placeholder={t("chapter.tactic.placeholder")}
        />
        <button className="btn-ghost" onClick={onRemove}>
          <Trash2 size={14} />
        </button>
      </div>

      <div className="tactic-form__controls">
        <select
          className="select"
          style={{ flex: 1 }}
          value={type}
          onChange={(e) => handleTypeChange(e.target.value)}
        >
          {TYPES(t).map((tp) => (
            <option key={tp.value} value={tp.value}>
              {tp.label}
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
                onChange({ ...tactic, target_sessions: parseInt(e.target.value) || null })
              }
              placeholder={t("chapter.tactic.ph_sessions")}
            />
            <input
              className="input"
              style={{ flex: 1 }}
              type="number"
              min="0.5"
              step="0.5"
              value={tactic.target_hours ?? ""}
              onChange={(e) =>
                onChange({ ...tactic, target_hours: parseFloat(e.target.value) || null })
              }
              placeholder={t("chapter.tactic.ph_hours")}
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
              onChange({ ...tactic, target_hours: parseFloat(e.target.value) || null })
            }
            placeholder={t("chapter.tactic.ph_hours_week")}
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
              onChange({ ...tactic, target_count: parseInt(e.target.value) || null })
            }
            placeholder={t("chapter.tactic.ph_count")}
          />
        )}
      </div>
    </div>
  );
}
