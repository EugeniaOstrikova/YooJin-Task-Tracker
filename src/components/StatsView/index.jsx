import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Cell, ResponsiveContainer
} from "recharts";
import { useCategories } from "../../context/CategoriesContext";
import { TRIMESTERS, getTrimesterForWeek } from "../../config/trimesters";
import { getWeeksBetween, formatWeekRange, getCurrentWeekId, isCycleWeek } from "../../lib/weekUtils";

function buildChartData(weeks, tasks, currentWeekId, catKeys) {
  return weeks.map(weekId => {
    const weekTasks = tasks.filter(t => t.week === weekId);
    const isPast    = weekId <  currentWeekId;
    const isCurrent = weekId === currentWeekId;
    const isCycle   = isCycleWeek(weekId);
    const entry = { weekId, label: formatWeekRange(weekId), isPast, isCurrent, isCycle };

    catKeys.forEach(cat => {
      const ct = weekTasks.filter(t => t.cat === cat);
      entry[`${cat}_done`] = ct.filter(t => t.done).length;
      entry[`${cat}_todo`] = ct.filter(t => !t.done).length;
    });

    return entry;
  });
}

function CustomTooltip({ active, payload, label, cats, catKeys }) {
  if (!active || !payload?.length) return null;
  const entry = payload[0]?.payload;
  const title = entry?.isCurrent
    ? `${label} (текущая)`
    : entry?.isPast
    ? `${label} (прошедшая)`
    : `${label} (план)`;

  const borderColor = entry?.isCycle
    ? "2px solid var(--c-cycle-bd)"
    : entry?.isCurrent
    ? "2px solid var(--c-teal-bd)"
    : "1px solid var(--c-border)";

  const titleColor = entry?.isCycle
    ? "var(--c-cycle)"
    : entry?.isCurrent
    ? "var(--c-accent)"
    : "var(--c-ink)";

  return (
    <div style={{
      background: "#fff", border: borderColor,
      borderRadius: 10, padding: "10px 14px", fontSize: 12,
    }}>
      <div style={{ fontWeight: 700, color: titleColor, marginBottom: 6 }}>{title}</div>
      <div style={{ marginBottom: 8, paddingBottom: 6, borderBottom: "1px solid #F1F5F9" }}>
        <span style={{ color: "var(--c-dim)" }}>Всего за неделю: </span>
        <span style={{ fontWeight: 700, color: "var(--c-nav)" }}>
          {catKeys.reduce((s, c) => s + (entry?.[`${c}_done`] ?? 0), 0)}/
          {catKeys.reduce((s, c) => s + (entry?.[`${c}_done`] ?? 0) + (entry?.[`${c}_todo`] ?? 0), 0)}
        </span>
      </div>
      {catKeys.map(cat => {
        const done = entry?.[`${cat}_done`] ?? 0;
        const todo = entry?.[`${cat}_todo`] ?? 0;
        if (done + todo === 0) return null;
        return (
          <div key={cat} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: cats[cat].dot }} />
            <span style={{ color: "var(--c-mid)" }}>{cats[cat].label}:</span>
            <span style={{ fontWeight: 600, color: "var(--c-ink)" }}>{done}/{done + todo}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function StatsView({ tasks, currentWeekId }) {
  const { cats } = useCategories();
  const CAT_KEYS  = Object.keys(cats);
  const current   = getTrimesterForWeek(currentWeekId) ?? TRIMESTERS[0];
  const [selId, setSelId] = useState(current.id);
  const trimester  = TRIMESTERS.find(t => t.id === selId) ?? TRIMESTERS[0];
  const weeks      = getWeeksBetween(trimester.start, trimester.end);
  const data       = buildChartData(weeks, tasks, currentWeekId, CAT_KEYS);

  const trimTasks = tasks.filter(t => t.week >= trimester.start && t.week <= trimester.end);
  const trimDone  = trimTasks.filter(t => t.done).length;
  const trimTotal = trimTasks.length;
  const pastTasks = trimTasks.filter(t => t.week < currentWeekId);
  const pastDone  = pastTasks.filter(t => t.done).length;

  return (
    <div className="stats-view">

      {/* Переключатель триместров */}
      <div className="trim-selector">
        {TRIMESTERS.map(t => (
          <button
            key={t.id}
            onClick={() => setSelId(t.id)}
            className={`trim-btn${selId === t.id ? " is-active" : ""}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Карточки итогов */}
      <div className="stats-cards">
        {[
          { label: "Всего задач в триместре",        value: trimTotal },
          { label: "Выполнено (прошедшие недели)",   value: `${pastDone} / ${pastTasks.length}` },
          { label: "% выполнения",                   value: pastTasks.length ? `${Math.round(pastDone / pastTasks.length * 100)}%` : "—" },
          { label: "Запланировано (будущие)",         value: trimTotal - pastTasks.length },
        ].map((card, i) => (
          <div key={i} className="stat-card">
            <div className="stat-card__lbl">{card.label}</div>
            <div className="stat-card__val">{card.value}</div>
          </div>
        ))}
      </div>

      {/* Легенда прошлое/будущее */}
      <div className="chart-legend">
        <div className="chart-legend__item">
          <div className="chart-legend__swatch" style={{ background: "var(--c-teal)" }} />
          <span className="chart-legend__label">Прошедшие недели (факт)</span>
        </div>
        <div className="chart-legend__item">
          <div className="chart-legend__swatch" style={{ background: "var(--c-teal)", opacity: 0.3, border: "1px dashed var(--c-teal)" }} />
          <span className="chart-legend__label">Будущие недели (план)</span>
        </div>
      </div>

      {/* График */}
      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 20 }} barCategoryGap="20%" barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis
              dataKey="label"
              height={50}
              tick={(props) => {
                const { x, y, payload, index } = props;
                const entry = data[index];
                return (
                  <g transform={`translate(${x},${y})`}>
                    <text
                      x={0} y={0} dy={12}
                      textAnchor="middle"
                      fontSize={10}
                      fill={entry?.isCycle ? "var(--c-cycle)" : "var(--c-dim)"}
                      fontWeight={entry?.isCycle ? 600 : 400}
                    >
                      {payload.value}
                    </text>
                  </g>
                );
              }}
            />
            <YAxis tick={{ fontSize: 11, fill: "var(--c-dim)" }} allowDecimals={false} />
            <Tooltip content={<CustomTooltip cats={cats} catKeys={CAT_KEYS} />} />

            {CAT_KEYS.map(cat => ([
              <Bar key={`${cat}_done`} dataKey={`${cat}_done`} stackId={cat} name={`${cats[cat].label} ✓`} fill={cats[cat].dot} radius={[0,0,0,0]}>
                {data.map((entry, i) => (
                  <Cell key={i} fillOpacity={entry.isPast || entry.isCurrent ? 1 : 0.3} />
                ))}
              </Bar>,
              <Bar key={`${cat}_todo`} dataKey={`${cat}_todo`} stackId={cat} name={`${cats[cat].label} ✗`} fill={cats[cat].dot} radius={[3,3,0,0]}>
                {data.map((entry, i) => (
                  <Cell key={i} fillOpacity={entry.isPast || entry.isCurrent ? 0.2 : 0.1} />
                ))}
              </Bar>
            ]))}
          </BarChart>
        </ResponsiveContainer>

        <div className="cat-legend">
          {CAT_KEYS.map(cat => (
            <div key={cat} className="cat-legend__item">
              <div className="cat-legend__dot" style={{ background: cats[cat].dot }} />
              <span className="cat-legend__lbl">{cats[cat].label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
