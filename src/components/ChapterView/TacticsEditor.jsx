import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import TacticForm from "./TacticForm";

export default function TacticsEditor({ tactics, onAdd, onChange, onRemove }) {
  const { t } = useTranslation();

  return (
    <>
      <div className="section-title section-title--dim">
        {t("chapter.target.sectionTactics")}
      </div>

      {tactics.map((tactic, i) => (
        <TacticForm
          key={tactic.id}
          tactic={tactic}
          onChange={(updated) => onChange(i, updated)}
          onRemove={() => onRemove(i)}
        />
      ))}

      <button className="btn-secondary btn--icon" style={{ width: "100%", fontSize: 12 }} onClick={onAdd}>
        <Plus size={12} /> {t("chapter.tactic.addBtn")}
      </button>
    </>
  );
}
