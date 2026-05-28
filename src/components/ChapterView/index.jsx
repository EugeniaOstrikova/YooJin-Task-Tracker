import { useState } from "react";
import { Plus } from "lucide-react";
import { useChapters } from "../../hooks/useChapter";
import { upsertTarget, upsertTactic } from "../../lib/chaptersStorage";
import { useTasks } from "../../hooks/useTasks";
import {
  calcExecutionScore,
  getChapterEndWeek,
} from "../../lib/executionScore";
import {
  getCurrentWeekId,
  getWeeksBetween,
  formatWeekRange,
} from "../../lib/weekUtils";
import CreateChapterModal from "./CreateChapterModal";
import ChapterDetail from "./ChapterDetail";

function ChapterCard({ chapter, tasks, tactics, onClick }) {
  const current = getCurrentWeekId();
  const weeks = getWeeksBetween(chapter.start_week, getChapterEndWeek(chapter));
  const weekNum = weeks.indexOf(current) + 1;
  const score = calcExecutionScore(chapter, tactics, tasks);

  return (
    <div
      className="card"
      onClick={onClick}
      style={{ cursor: "pointer", borderTop: "3px solid var(--c-teal)" }}
    >
      <div
        style={{
          fontSize: 15,
          fontWeight: 700,
          color: "var(--c-ink)",
          marginBottom: 4,
        }}
      >
        {chapter.title}
      </div>
      <div style={{ fontSize: 12, color: "var(--c-dim)", marginBottom: 12 }}>
        {chapter.start_week} · {chapter.duration_weeks} недель
        {weekNum > 0 && weekNum <= chapter.duration_weeks && (
          <span style={{ color: "var(--c-teal)", fontWeight: 600 }}>
            {" "}
            · Неделя {weekNum} из {chapter.duration_weeks}
          </span>
        )}
      </div>

      {score && (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 4,
            }}
          >
            <span style={{ fontSize: 11, color: "var(--c-dim)" }}>
              Execution Score
            </span>
            <span
              style={{ fontSize: 11, fontWeight: 700, color: "var(--c-teal)" }}
            >
              {Math.round(score.score * 100)}% · {score.passed}/{score.total}{" "}
              недель
            </span>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${score.score * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function ChapterView() {
  const { chapters, loading, saveChapter, removeChapter } = useChapters();
  const { tasks } = useTasks();
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState(null);

  async function handleCreate({ chapter, targets, tactics }) {
    await saveChapter(chapter);
    for (const t of targets) await upsertTarget(t);
    for (const t of tactics) await upsertTactic(t);
  }

  if (loading) return <div className="screen-loading">Загрузка...</div>;

  if (selected) {
    return (
      <ChapterDetail
        chapter={selected}
        tasks={tasks}
        onBack={() => setSelected(null)}
        onDelete={async (id) => {
          await removeChapter(id);
          setSelected(null);
        }}
      />
    );
  }

  return (
    <div style={{ padding: "20px 20px 40px", maxWidth: 800, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "var(--c-ink)" }}>
            Chapters
          </div>
          <div style={{ fontSize: 13, color: "var(--c-dim)", marginTop: 2 }}>
            12-недельные блоки фокуса
          </div>
        </div>
        <button
          className="btn-primary"
          style={{ display: "flex", alignItems: "center", gap: 6 }}
          onClick={() => setCreating(true)}
        >
          <Plus size={14} /> Новая глава
        </button>
      </div>

      {chapters.length === 0 ? (
        <div className="empty--center">
          Нет глав.
          <br />
          <span style={{ fontSize: 12 }}>
            Создай первую 12-недельную главу.
          </span>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 12,
          }}
        >
          {chapters.map((ch) => (
            <ChapterCard
              key={ch.id}
              chapter={ch}
              tasks={tasks}
              tactics={[]}
              onClick={() => setSelected(ch)}
            />
          ))}
        </div>
      )}

      {creating && (
        <CreateChapterModal
          onSave={handleCreate}
          onClose={() => setCreating(false)}
        />
      )}
    </div>
  );
}
