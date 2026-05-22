import { useCategories } from "../../context/CategoriesContext";

export default function ColorLegend() {
  const { cats, loading } = useCategories();

  if (loading) return null;

  return (
    <div className="color-legend">
      {Object.entries(cats).map(([key, cat]) => (
        <div key={key} className="cat-legend__item">
          <div
            className="cat-legend__dot"
            style={{ background: cat.bg, border: `1.5px solid ${cat.dot}` }}
          />
          <span className="cat-legend__lbl">{cat.label}</span>
        </div>
      ))}
    </div>
  );
}