export default function ProgressBar({ pct, variant, size }) {
  const trackClass = [
    "progress-track",
    size === "thick" && "progress-track--thick",
    size === "thin" && "progress-track--thin",
  ]
    .filter(Boolean)
    .join(" ");

  const fillClass = [
    "progress-fill",
    variant && `progress-fill--${variant}`,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={trackClass}>
      <div className={fillClass} style={{ width: `${pct}%` }} />
    </div>
  );
}
