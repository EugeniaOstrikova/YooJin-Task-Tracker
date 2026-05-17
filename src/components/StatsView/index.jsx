import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, Cell, ResponsiveContainer
} from "recharts";
import { useCategories } from "../../context/CategoriesContext";
import { TRIMESTERS, getTrimesterForWeek } from "../../config/trimesters";
import { getWeeksBetween, formatWeekRange, getCurrentWeekId, isCycleWeek } from "../../lib/weekUtils";

function buildChartData(weeks, tasks, currentWeekId, catKeys) {
  return weeks.map(weekId => {
    const weekTasks = tasks.filter(t => t.week === weekId);
    const isPast    = weekId <  currentWeekId;
    const isCurrent = weekId === currentWeekId;
    const isCycle = isCycleWeek(weekId);
    const entry = { weekId, label: formatWeekRange(weekId), isPast, isCurrent, isCycle };

    catKeys.forEach(cat => {
      const ct = weekTasks.filter(t => t.cat === cat);
      entry[`${cat}_done`] = ct.filter(t => t.done).length;
      entry[`${cat}_todo`] = ct.filter(t => !t.done).length;
    });

    return entry;
  });
}

// Кастомный тултип
function CustomTooltip({ active, payload, label, cats, catKeys }) {
  if (!active || !payload?.length) return null;
  const entry = payload[0]?.payload;
  const title = entry?.isCurrent ? `${label} (текущая)` : entry?.isPast ? `${label} (прошедшая)` : `${label} (план)`;

  return (
    <div style={{ 
        background: "#fff", 
        border: entry?.isCycle
            ? "2px solid #E8B5A8"
            : entry?.isCurrent
            ? "2px solid #B8D6DC"
            : "1px solid #E2E8F0",
        borderRadius: 10, 
        padding: "10px 14px", fontSize: 12 }}>
      <div style={{ 
        fontWeight: 700, 
        color: entry?.isCycle
            ? "#C0614F"
            : entry?.isCurrent
            ? "#4A7A85"
            : "#0F172A",
        marginBottom: 6 }}>
            {title}
      </div>
      {catKeys.map(cat => {
        const done = entry?.[`${cat}_done`] ?? 0;
        const todo = entry?.[`${cat}_todo`] ?? 0;
        if (done + todo === 0) return null;
        return (
          <div key={cat} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: cats[cat].dot }} />
            <span style={{ color: "#64748B" }}>{cats[cat].label}:</span>
            <span style={{ fontWeight: 600, color: "#0F172A" }}>{done}/{done + todo}</span>
          </div>
        );
      })}
      {(() => {
        const totalDone  = catKeys.reduce((s, cat) => s + (entry?.[`${cat}_done`] ?? 0), 0);
        const totalTodo  = catKeys.reduce((s, cat) => s + (entry?.[`${cat}_todo`] ?? 0), 0);
        const total      = totalDone + totalTodo;
        return (
            <div style={{ marginBottom: 8, paddingBottom: 6, borderBottom: "1px solid #F1F5F9" }}>
            <span style={{ color: "#94A3B8" }}>Всего за неделю: </span>
            <span style={{ fontWeight: 700, color: "#2C5F6A" }}>{totalDone}/{total}</span>
            </div>
        );
        })()}
    </div>
  );
}

export default function StatsView({ tasks, currentWeekId }) {
  const { cats } = useCategories();
  const CAT_KEYS = Object.keys(cats);
  const current    = getTrimesterForWeek(currentWeekId) ?? TRIMESTERS[0];
  const [selId, setSelId] = useState(current.id);
  const trimester  = TRIMESTERS.find(t => t.id === selId) ?? TRIMESTERS[0];
  const weeks      = getWeeksBetween(trimester.start, trimester.end);
  const data       = buildChartData(weeks, tasks, currentWeekId, CAT_KEYS);

  // Итоги триместра
  const trimTasks  = tasks.filter(t => t.week >= trimester.start && t.week <= trimester.end);
  const trimDone   = trimTasks.filter(t => t.done).length;
  const trimTotal  = trimTasks.length;
  const pastTasks  = trimTasks.filter(t => t.week < currentWeekId);
  const pastDone   = pastTasks.filter(t => t.done).length;

  return (
    <div style={{ padding: "16px 20px 40px", fontFamily: "Montserrat, system-ui, sans-serif" }}>

      {/* Переключатель триместров */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {TRIMESTERS.map(t => (
          <button key={t.id} onClick={() => setSelId(t.id)} style={{
            padding: "6px 14px", fontSize: 12, borderRadius: 20, cursor: "pointer",
            border:      selId === t.id ? "1.5px solid #76A5AF" : "1px solid #E2E8F0",
            background:  selId === t.id ? "#EAF3F5" : "#fff",
            color:       selId === t.id ? "#4A7A85" : "#64748B",
            fontWeight:  selId === t.id ? 600 : 400,
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Карточки итогов */}
      <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
        {[
          { label: "Всего задач в триместре", value: trimTotal },
          { label: "Выполнено (прошедшие недели)", value: `${pastDone} / ${pastTasks.length}` },
          { label: "% выполнения",  value: pastTasks.length ? `${Math.round(pastDone / pastTasks.length * 100)}%` : "—" },
          { label: "Запланировано (будущие)", value: trimTotal - pastTasks.length },
        ].map((card, i) => (
          <div key={i} style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, padding: "12px 18px", minWidth: 160 }}>
            <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 4 }}>{card.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#2C5F6A" }}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* Легенда прошлое/будущее */}
      <div style={{ display: "flex", gap: 16, marginBottom: 12, alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 24, height: 10, background: "#76A5AF", borderRadius: 2 }} />
          <span style={{ fontSize: 11, color: "#64748B" }}>Прошедшие недели (факт)</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 24, height: 10, background: "#76A5AF", opacity: 0.3, borderRadius: 2, border: "1px dashed #76A5AF" }} />
          <span style={{ fontSize: 11, color: "#64748B" }}>Будущие недели (план)</span>
        </div>
      </div>

      {/* График */}
      <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 14, padding: "20px 10px 10px" }}>
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
                        fill={entry?.isCycle ? "#C0614F" : "#94A3B8"}
                        fontWeight={entry?.isCycle ? 600 : 400}
                        >
                        {payload.value}
                        </text>
                    </g>
                    );
                }}
                />
            <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} allowDecimals={false} />
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

        {/* Легенда категорий */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginTop: 8 }}>
          {CAT_KEYS.map(cat => (
            <div key={cat} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: cats[cat].dot }} />
              <span style={{ fontSize: 11, color: "#64748B" }}>{cats[cat].label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}