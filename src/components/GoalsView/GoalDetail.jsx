import { useState } from "react";
import { ArrowLeft, Plus, Trash2, Edit2, X } from "lucide-react";
import { useGoalStages, useTaskGroups } from "../../hooks/useGoals";
import { useCategories } from "../../context/CategoriesContext";
import TaskCard      from "../shared/TaskCard";
import TaskEditModal from "../shared/TaskEditModal";
import { patchTask } from "../../lib/storage";
import { DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useDroppable, useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

const STATUSES = ["Idea","Planning","In Progress","On Hold","Completed","Cancelled"];

// Draggable task wrapper
function DraggableTask({ task, onToggle, onEdit, onSave }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id });
  return (
    <div ref={setNodeRef} {...attributes} {...listeners}
      style={{ transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.4 : 1 }}>
      <TaskCard task={task} onToggle={onToggle} onEdit={onEdit} onSave={onSave} compact />
    </div>
  );
}

function DroppableGroup({ group, tasks, onToggle, onEdit, onSave, onAddTask, onRemove }) {
  const { setNodeRef, isOver } = useDroppable({ id: group.id });

  return (
    <div
      ref={setNodeRef}
      className="task-group"
      style={{
        borderColor: isOver ? "var(--c-teal)" : undefined,
        background:  isOver ? "var(--c-teal-bg)" : undefined,
      }}
    >
      <div className="task-group__header">
        <span className="task-group__title">{group.title}</span>
        <div style={{ display: "flex", gap: 4 }}>
          <span style={{ fontSize: 11, color: "var(--c-dim)" }}>
            {tasks.filter(t => t.done).length}/{tasks.length}
          </span>
          <button className="btn-ghost" onClick={() => onAddTask(group.id)}>
            <Plus size={11} />
          </button>
          <button className="btn-ghost" onClick={onRemove} style={{ color: "var(--c-faint)" }}>
            <X size={11} />
          </button>
        </div>
      </div>

      {tasks.map(t => (
        <DraggableTask key={t.id} task={t} onToggle={onToggle} onEdit={onEdit} onSave={onSave} />
      ))}

      {tasks.length === 0 && <div className="empty">—</div>}
    </div>
  );
}

// Droppable stage column
function StageColumn({ stage, tasks, onToggle, onEdit, onSave, onAddTask, goalId }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });
  const { groups, saveGroup, removeGroup } = useTaskGroups(stage.id === "pool" ? null : stage.id);

  const ungrouped = tasks.filter(t => !t.group_id);

  function addGroup() {
    const title = prompt("Group name:");
    if (!title?.trim()) return;
    saveGroup({
      id:       `group_${Date.now()}`,
      stage_id: stage.id,
      title:    title.trim(),
      sort:     groups.length,
    });
  }

  return (
    <div ref={setNodeRef} className={`stage-col${isOver ? " stage-col--over" : ""}`}>

      <div className="stage-col__header">
        <span className="stage-col__title">{stage.title}</span>
        <div style={{ display: "flex", gap: 6 }}>
          {stage.id !== "pool" && (
            <button className="btn-ghost" onClick={addGroup}>
              <Plus size={12} /> группа
            </button>
          )}
          <button className="btn-ghost" onClick={() => onAddTask(null)}>
            <Plus size={13} />
          </button>
        </div>
      </div>

      {/* Группы */}
      {groups.map(group => (
        <DroppableGroup
          key={group.id}
          group={group}
          tasks={tasks.filter(t => t.group_id === group.id)}
          onToggle={onToggle}
          onEdit={onEdit}
          onSave={onSave}
          onAddTask={onAddTask}
          onRemove={() => removeGroup(group.id)}
        />
      ))}

      {/* Задачи без группы */}
      {ungrouped.map(t => (
        <DraggableTask key={t.id} task={t} onToggle={onToggle} onEdit={onEdit} onSave={onSave} />
      ))}

      {tasks.length === 0 && groups.length === 0 && (
        <div className="empty">No tasks yet</div>
      )}
    </div>
  );
}

export default function GoalDetail({ goal, tasks, onBack, onUpdate, onDelete }) {
  const { cats }    = useCategories();
  const { stages, saveStage, removeStage } = useGoalStages(goal.id);
  const catStyle    = cats[goal.cat];

  const [editingTask,  setEditingTask]  = useState(null);
  const [addingToStage, setAddingToStage] = useState(null);
  const [editingGoal,  setEditingGoal]  = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  // Задачи без этапа (пул цели)
  const poolTasks   = tasks.filter(t => t.goal_id === goal.id && !t.stage_id);

  // Задачи по этапам
  const tasksByStage = (stageId) => tasks.filter(t => t.stage_id === stageId);

  async function handleDragEnd({ active, over }) {
    if (!over) return;
    const overId = over.id;

    // Если дропнули в группу
    if (overId.startsWith("group_")) {
      await patchTask(active.id, { group_id: overId });
    }
    // Если дропнули в этап (без группы)
    else if (overId.startsWith("stage_")) {
      await patchTask(active.id, { stage_id: overId, group_id: null });
    }
    // Если дропнули в пул
    else if (overId === "pool") {
      await patchTask(active.id, { stage_id: null, group_id: null });
    }
  }

  async function handleToggle(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    await patchTask(id, { done: !task.done });
  }

  async function handleSaveTask(id, updates) {
    await patchTask(id, updates);
  }

  function formatDeadline(d) {
    if (!d) return null;
    return new Date(d).toLocaleDateString("ru", { day: "numeric", month: "long", year: "numeric" });
  }

  return (
    <div style={{ padding: "20px 20px 40px" }}>

      {/* Навигация */}
      <button className="btn-ghost" onClick={onBack}
        style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20, color: "var(--c-mid)" }}>
        <ArrowLeft size={16} /> Back to Goals
      </button>

      {/* Заголовок цели */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "var(--c-ink)" }}>
              {goal.title}
            </h2>
            {catStyle && (
              <span style={{
                fontSize: 11, color: catStyle.text, background: catStyle.bg,
                borderRadius: "var(--r-pill)", padding: "2px 10px",
              }}>
                {catStyle.label}
              </span>
            )}
            <span className="badge" style={{ fontSize: 11 }}>{goal.status}</span>
          </div>

          {goal.deadline && (
            <div style={{ fontSize: 12, color: "var(--c-dim)", marginBottom: 8 }}>
              Deadline: {formatDeadline(goal.deadline)}
            </div>
          )}

          {goal.motivation && (
            <div style={{ fontSize: 13, color: "var(--c-mid)", marginBottom: 6 }}>
              <strong>Why:</strong> {goal.motivation}
            </div>
          )}

          {goal.success_criteria && (
            <div style={{ fontSize: 13, color: "var(--c-mid)" }}>
              <strong>Success:</strong> {goal.success_criteria}
            </div>
          )}
        </div>

        <button className="btn-ghost" onClick={() => onDelete(goal.id)}
          style={{ color: "var(--c-missed)" }}>
          <Trash2 size={16} />
        </button>
      </div>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div style={{ display: "flex", gap: 16 }}>

          {/* Левая колонка — пул задач */}
          <div style={{ flex: "0 0 260px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--c-dim)",
              textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
              Task Pool
            </div>
            <StageColumn
              stage={{ id: "pool", title: "Pool" }}
              tasks={poolTasks}
              onToggle={handleToggle}
              onEdit={setEditingTask}
              onSave={handleSaveTask}
              onAddTask={() => setAddingToStage("pool")}
            />
          </div>

          {/* Правая колонка — этапы */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--c-dim)",
                textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Stages
              </div>
              <button className="btn-secondary" style={{ fontSize: 12, padding: "4px 10px" }}
                onClick={() => {
                  const title = prompt("Stage name:");
                  if (title?.trim()) saveStage({
                    id: `stage_${Date.now()}`,
                    goal_id: goal.id,
                    title: title.trim(),
                    sort: stages.length,
                    status: "Planning",
                  });
                }}>
                <Plus size={12} /> Add Stage
              </button>
            </div>

            {stages.length === 0 && (
              <div className="empty">No stages yet. Add your first stage.</div>
            )}

            {stages.map(stage => (
              <StageColumn
                key={stage.id}
                stage={stage}
                tasks={tasksByStage(stage.id)}
                onToggle={handleToggle}
                onEdit={setEditingTask}
                onSave={handleSaveTask}
                onAddTask={() => setAddingToStage(stage.id)}
              />
            ))}
          </div>
        </div>
      </DndContext>

      {/* Модалка создания задачи */}
      {addingToStage && (
        <TaskEditModal
          defaultDay=""
          weekId=""
          onAdd={async (newTasks) => {
            const t = newTasks[0];
            await patchTask(t.id, {
              goal_id:  goal.id,
              stage_id: addingToStage === "pool" ? null : addingToStage,
              cat:      t.cat || goal.cat || "other",
            });
          }}
          onClose={() => setAddingToStage(null)}
        />
      )}

      {/* Модалка редактирования задачи */}
      {editingTask && (
        <TaskEditModal
          task={editingTask}
          onSave={handleSaveTask}
          onClose={() => setEditingTask(null)}
        />
      )}
    </div>
  );
}