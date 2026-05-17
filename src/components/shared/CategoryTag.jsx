import { useCategories } from "../../context/CategoriesContext";

export default function CategoryTag({ cat, small = false }) {
  const { cats } = useCategories();
  const c = cats[cat];
  if (!c) return null;
  return (
    <span
      className="badge"
      style={{
        background: c.bg,
        color: c.text,
        padding: small ? "1px 7px" : "2px 9px",
        fontSize: small ? 10 : 11,
        gap: 4,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot, flexShrink: 0 }} />
      {c.label}
    </span>
  );
}
