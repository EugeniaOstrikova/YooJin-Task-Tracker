import { Asterisk, Flame, Zap, Star } from "lucide-react";

export default function PriorityIcon({ urgent, effort, size = 13 }) {
  return (
    <span style={{ display: "inline-flex", gap: 2, alignItems: "center" }}>
      {urgent && (
        <Star size={size} className="priority-icon--urgent" title="Срочно" />
      )}
      {effort === "heavy" && (
        <Zap size={size} className="priority-icon--heavy" title="Тяжёлая" />
      )}
      {effort === "light" && (
        <Zap size={size} className="priority-icon--light" title="Лёгкая" />
      )}
    </span>
  );
}