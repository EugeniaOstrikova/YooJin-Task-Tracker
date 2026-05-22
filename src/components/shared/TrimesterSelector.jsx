import { TRIMESTERS } from "../../config/trimesters";

export default function TrimesterSelector({ selected, onChange }) {
  return (
    <div className="trim-selector">
      {TRIMESTERS.map(t => (
        <button
          key={t.id}
          className={`trim-btn${selected === t.id ? " is-active" : ""}`}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}