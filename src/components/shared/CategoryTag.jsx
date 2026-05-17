import { useCategories } from "../../context/CategoriesContext";

export default function CategoryTag({ cat, small = false }) {
  const { cats } = useCategories();
  const c = cats[cat];
  if (!c) return null;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        background: c.bg,
        color: c.text,
        borderRadius: 20,
        padding: small ? "1px 7px" : "2px 9px",
        fontSize: small ? 10 : 11,
        fontWeight: 600,
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot, flexShrink: 0 }} />
      {c.label}
    </span>
  );
}
