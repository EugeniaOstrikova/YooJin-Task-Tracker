import { useState } from "react";
import { useTasks }       from "./hooks/useTasks";
import { getCurrentWeekId } from "./lib/weekUtils";
import TopNav             from "./components/shared/TopNav";
import ImportModal        from "./components/shared/ImportModal";
import WeekView           from "./components/WeekView";
import TrimesterView      from "./components/TrimesterView";
import ColorLegend from "./components/shared/ColorLegend";
import StatsView from "./components/StatsView";
import ReviewView from "./components/ReviewView";
import { CategoriesProvider } from "./context/CategoriesContext";
import { useAuth }      from "./hooks/useAuth";
import LoginScreen      from "./components/Auth/LoginScreen";
import { signOut } from "./lib/auth";

export default function App() {
  const { user, loading: authLoading } = useAuth();
  const { tasks, loading, error, toggleDone, importTasks, restoreFromJson, exportTasks, updateTaskLocally } = useTasks();

  const [view,        setView]        = useState("week");
  const [weekId,      setWeekId]      = useState(getCurrentWeekId);
  const [showImport,  setShowImport]  = useState(false);

  function handleNavigateWeek(id) {
    setWeekId(id);
    setView("week");
  }
  
  if (authLoading) return (
    <div className="screen-auth-loading">Загрузка...</div>
  );
  // if (loading) return <div className="screen-loading">Загрузка...</div>;
  if (error)   return <div className="screen-error">Ошибка: {error}</div>;

  if (!user) return <LoginScreen />;

  return (
    <CategoriesProvider>
      <div className="app-root">
        <TopNav
          view={view}
          onViewChange={setView}
          onImport={() => setShowImport(true)}
          onExport={exportTasks}
          onSignOut={signOut}
        />
        <ColorLegend />

        {view === "week" &&
          <WeekView
            weekId={weekId}
            onWeekChange={setWeekId}
            tasks={tasks}
            onToggle={toggleDone}
            onUpdateTask={updateTaskLocally}
          />
        }
        {view === "trimester" &&
          <TrimesterView
            tasks={tasks}
            onToggle={toggleDone}
            onNavigateWeek={handleNavigateWeek}
            currentWeekId={weekId}
          />
        }
        {view === "stats"  && <StatsView tasks={tasks} currentWeekId={weekId} />}
        {view === "review" && <ReviewView tasks={tasks} onTaskUpdate={updateTaskLocally} />}

        {showImport && (
          <ImportModal
            onImport={importTasks}
            onRestore={restoreFromJson}
            onClose={() => setShowImport(false)}
          />
        )}
      </div>
    </CategoriesProvider>
  );
}
