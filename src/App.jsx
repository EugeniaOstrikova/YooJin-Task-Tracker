import { useState } from "react";
import { useTasks } from "./hooks/useTasks";
import { getCurrentWeekId } from "./lib/weekUtils";
import TopNav from "./components/shared/TopNav";
import ImportModal from "./components/shared/ImportModal";
import WeekView from "./components/WeekView";
import ChapterView from "./components/ChapterView";
import ColorLegend from "./components/shared/ColorLegend";
import StatsView from "./components/StatsView";
import ReviewView from "./components/ReviewView";
import { CategoriesProvider } from "./context/CategoriesContext";
import { useAuth } from "./hooks/useAuth";
import LoginScreen from "./components/Auth/LoginScreen";
import { signOut } from "./lib/auth";
import GoalsView from "./components/GoalsView";
import { useChapters } from "./hooks/useChapter";
import { getChapterEndWeek } from "./lib/executionScore";

export default function App() {
  const { user, loading: authLoading } = useAuth();
  const {
    tasks,
    loading,
    error,
    toggleDone,
    importTasks,
    restoreFromJson,
    exportTasks,
    updateTaskLocally,
    saveTask,
  } = useTasks();

  const [view, setView] = useState("week");
  const [weekId, setWeekId] = useState(getCurrentWeekId);
  const [showImport, setShowImport] = useState(false);
  const { chapters } = useChapters();
  const [activeChapterId, setActiveChapterId] = useState(null);

  function handleNavigateWeek(id) {
    setWeekId(id);
    setView("week");
  }

  const currentChapter = chapters.find((ch) => {
    const end = getChapterEndWeek(ch);
    return weekId >= ch.start_week && weekId <= end;
  });

  function handleNavigateToChapter(chapter) {
    setActiveChapterId(chapter.id);
    setView("chapter");
  }

  if (authLoading)
    return <div className="screen-auth-loading">Загрузка...</div>;
  if (error) return <div className="screen-error">Ошибка: {error}</div>;

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

        {view === "week" && (
          <WeekView
            weekId={weekId}
            onWeekChange={setWeekId}
            tasks={tasks}
            onToggle={toggleDone}
            onUpdateTask={saveTask}
            onAddTask={importTasks}
            currentChapter={currentChapter}
            onNavigateToChapter={handleNavigateToChapter}
          />
        )}
        {view === "chapter" && (
          <ChapterView
            activeChapterId={activeChapterId}
            onClearActiveChapter={() => setActiveChapterId(null)}
          />
        )}
        {view === "stats" && <StatsView tasks={tasks} currentWeekId={weekId} />}
        {view === "review" && (
          <ReviewView tasks={tasks} onTaskUpdate={updateTaskLocally} />
        )}
        {view === "goals" && <GoalsView />}

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
