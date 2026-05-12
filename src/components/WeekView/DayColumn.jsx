import TaskCard from "../shared/TaskCard";

export default function DayColumn({ day, tasks, onToggle }) {
  const { shortLabel, isToday } = day;

  return (
    <div
      style={{
        flex:          "0 0 200px",
        minWidth:      180,
        background:    isToday ? "#F0F9FF" : "#fff",
        border:        isToday ? "1px solid #BAE6FD" : "1px solid #E2E8F0",
        borderRadius:  12,
        padding:       "10px 10px 12px",
        display:       "flex",
        flexDirection: "column",
        gap:           2,
      }}
    >
      {/* Заголовок дня */}
      <div
        style={{
          fontSize:     12,
          fontWeight:   600,
          color:        isToday ? "#0369A1" : "#64748B",
          marginBottom: 8,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          display:       "flex",
          alignItems:    "center",
          gap:           6,
        }}
      >
        {shortLabel}
        {isToday && (
          <span style={{ background: "#0EA5E9", color: "#fff", borderRadius: 20, fontSize: 9, padding: "1px 6px", fontWeight: 700 }}>
            сегодня
          </span>
        )}
      </div>

      {/* Задачи */}
      {tasks.length === 0 ? (
        <div style={{ fontSize: 12, color: "#CBD5E1", textAlign: "center", marginTop: 16, fontStyle: "italic" }}>
          —
        </div>
      ) : (
        tasks.map(t => (
          <TaskCard key={t.id} task={t} onToggle={onToggle} />
        ))
      )}
    </div>
  );
}
