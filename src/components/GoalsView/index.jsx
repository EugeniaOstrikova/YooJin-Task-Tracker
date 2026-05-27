import { useState } from "react";
import { Plus } from "lucide-react";
import { useGoals } from "../../hooks/useGoals";
import { upsertStage } from "../../lib/goalsStorage";
import { useTasks } from "../../hooks/useTasks";
import GoalCard        from "./GoalCard";
import CreateGoalModal from "./CreateGoalModal";
import GoalDetail      from "./GoalDetail";

export default function GoalsView() {
  const { goals, loading, saveGoal, removeGoal } = useGoals();
  const { tasks } = useTasks();
  const [creating,    setCreating]    = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);

  async function handleCreate(goal, stages) {
    await saveGoal(goal);
    for (const stage of stages) {
      await upsertStage(stage);
    }
  }

  if (loading) return <div className="screen-loading">Loading...</div>;

  if (selectedGoal) {
    return (
      <GoalDetail
        goal={selectedGoal}
        tasks={tasks}
        onBack={() => setSelectedGoal(null)}
        onUpdate={saveGoal}
        onDelete={async (id) => { await removeGoal(id); setSelectedGoal(null); }}
      />
    );
  }

  return (
    <div style={{ padding: "20px 20px 40px", maxWidth: 900, margin: "0 auto" }}>

      {/* Заголовок */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "var(--c-ink)" }}>Goals</div>
          <div style={{ fontSize: 13, color: "var(--c-dim)", marginTop: 2 }}>
            {goals.length} goals · {goals.filter(g => g.status === "In Progress").length} in progress
          </div>
        </div>
        <button className="btn-primary" onClick={() => setCreating(true)}
          style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Plus size={14} /> New Goal
        </button>
      </div>

      {/* Список */}
      {goals.length === 0 ? (
        <div className="empty--center">
          No goals yet.<br />
          <span style={{ fontSize: 12 }}>Create your first goal to get started.</span>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
          {goals.map(goal => {
            const goalTasks = tasks.filter(t => t.goal_id === goal.id || 
              tasks.find(t2 => t2.stage_id && t2.stage_id.startsWith(`stage_`) && t2.goal_id === goal.id));
            const goalTasksDirect = tasks.filter(t => t.goal_id === goal.id);
            return (
              <GoalCard
                key={goal.id}
                goal={goal}
                taskCount={goalTasksDirect.length}
                doneCount={goalTasksDirect.filter(t => t.done).length}
                onClick={() => setSelectedGoal(goal)}
              />
            );
          })}
        </div>
      )}

      {creating && (
        <CreateGoalModal
          onSave={handleCreate}
          onClose={() => setCreating(false)}
        />
      )}
    </div>
  );
}