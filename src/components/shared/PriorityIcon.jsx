/**
 * Иконка приоритета по матрице Эйзенхауэра.
 * 🔴 важно + срочно
 * 🟡 важно + не срочно
 * 🟠 не важно + срочно
 * (ничего) — не важно + не срочно
 */
export default function PriorityIcon({ important, urgent, size = 14 }) {
  if (important && urgent)  return <span style={{ fontSize: size }} title="Важно и срочно">🔴</span>;
  if (important && !urgent) return <span style={{ fontSize: size }} title="Важно, не срочно">🟡</span>;
  if (!important && urgent) return <span style={{ fontSize: size }} title="Срочно, не важно">🟠</span>;
  return null;
}
