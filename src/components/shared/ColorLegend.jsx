import { CATS } from "../../config/categories";

export default function ColorLegend() {
  return (
    <div
      style={{
        display:    "flex",
        gap:        16,
        flexWrap:   "wrap",
        padding:    "8px 16px",
        background: "#fff",
        borderBottom: "1px solid #E2E8F0",
      }}
    >
      {Object.entries(CATS).map(([key, cat]) => (
        <div key={key} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 14, height: 14, borderRadius: 4, background: cat.bg, border: `1.5px solid ${cat.dot}` }} />
          <span style={{ fontSize: 11, color: "#64748B", fontWeight: 500 }}>{cat.label}</span>
        </div>
      ))}
    </div>
  );
}
