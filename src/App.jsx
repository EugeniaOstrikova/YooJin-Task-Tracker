import { useState } from "react";
import { useTasks }       from "./hooks/useTasks";
import { getCurrentWeekId } from "./lib/weekUtils";
import TopNav             from "./components/shared/TopNav";
import ImportModal        from "./components/shared/ImportModal";
import WeekView           from "./components/WeekView";
import TrimesterView      from "./components/TrimesterView";
import ColorLegend from "./components/shared/ColorLegend";

export default function App() {
  const { tasks, loading, error, toggleDone, importTasks, restoreFromJson, exportTasks } = useTasks();

  const [view,        setView]        = useState("week"); // "week" | "trimester"
  const [weekId,      setWeekId]      = useState(getCurrentWeekId);
  const [showImport,  setShowImport]  = useState(false);

  // Из триместр-вью перейти в неделю
  function handleNavigateWeek(id) {
    setWeekId(id);
    setView("week");
  }

  if (loading) return (
    <div style={{ padding: 32, color: "#94A3B8", fontSize: 14, fontFamily: "system-ui" }}>
      Загрузка...
    </div>
  );

  if (error) return (
    <div style={{ padding: 32, color: "#DC2626", fontSize: 14, fontFamily: "system-ui" }}>
      Ошибка: {error}
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#F8F7F5" }}>
      <TopNav
        view={view}
        onViewChange={setView}
        onImport={() => setShowImport(true)}
        onExport={exportTasks}
      />
      <ColorLegend />

      {view === "week" ? (
        <WeekView
          weekId={weekId}
          onWeekChange={setWeekId}
          tasks={tasks}
          onToggle={toggleDone}
        />
      ) : (
        <TrimesterView
          tasks={tasks}
          onToggle={toggleDone}
          onNavigateWeek={handleNavigateWeek}
          currentWeekId={weekId}
        />
      )}

      {showImport && (
        <ImportModal
          onImport={importTasks}
          onRestore={restoreFromJson}
          onClose={() => setShowImport(false)}
        />
      )}
    </div>
  );
}
