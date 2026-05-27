import { useState, useRef } from "react";
import PriorityIcon from "./PriorityIcon";
import CategoryTag  from "./CategoryTag";
import { useCategories } from "../../context/CategoriesContext";
import { formatDuration } from "../../lib/weekUtils";
import { Link2, X } from "lucide-react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import Checkbox from "@mui/material/Checkbox";
import { getCatCardStyle } from "../../lib/categoryStyles";

export default function TaskCard({ task, onToggle, onEdit, onSave, compact = false, linked }) {
  const { cats } = useCategories();
  const { text, cat, done, important = false, urgent = false, deadline = false } = task;
  const catStyle = cats[task.cat] ?? { bg: "#F1F5F9", text: "#64748B", dot: "#94A3B8" };
  const durationLabel = formatDuration(task.duration);
  const actualDurationLabel = formatDuration(task.actual_duration);
  const [editingActual, setEditingActual] = useState(false);
  const [actualInput,   setActualInput]   = useState(task.actual_duration ?? "");
  const inputRef = useRef(null);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });

  const cardStyle = getCatCardStyle(catStyle, { 
    noBorder:    cat === "other",
    noGradient:  cat === "other",
  });

  function handleActualSave() {
    const val = parseFloat(actualInput);
    onSave?.(task.id, { actual_duration: isNaN(val) ? null : val });
    setEditingActual(false);
  }

  return (
    <div
      className={`task-card${compact ? " task-card--compact" : ""}${done ? " task-card--done" : ""}`}
      style={{...cardStyle}}
      ref={setNodeRef}
      {...attributes}
      {...listeners}
    >
      {/* Чекбокс */}
      <Checkbox
        checked={done}
        onChange={e => { e.stopPropagation(); onToggle(task.id); }}
        onPointerDown={e => e.stopPropagation()}
        size="small"
        sx={{
          padding: 0,
          color: catStyle.dot,
          "&.Mui-checked": { color: catStyle.dot },
        }}
      />

      {/* Контент */}
      <div className="task-card__body">
        <div className="task-card__row">
          <PriorityIcon urgent={task.urgent} effort={task.effort} size={14} />
          <span 
            onClick={e => { e.stopPropagation(); onEdit?.(task); }}
            className={`task-card__text${compact ? " task-card__text--compact" : ""}${done ? " task-card__text--done" : ""}`}
          >
            {text}
          </span>

          {actualDurationLabel && durationLabel && actualDurationLabel !== durationLabel ? (
            <span className="task-card__dur"
              onClick={() => { setEditingActual(true); setTimeout(() => inputRef.current?.focus(), 0); }} 
            >
              {actualDurationLabel} / {durationLabel}
            </span>
          ) : durationLabel ? (
            <span 
              onClick={() => { setEditingActual(true); setTimeout(() => inputRef.current?.focus(), 0); }}
              className="task-card__dur"
            >
              {durationLabel}
            </span>
          ) : null}
        </div>
        {editingActual && (
          <input
            ref={inputRef}
            className="task-card__actual-input"
            value={actualInput}
            onChange={e => setActualInput(e.target.value)}
            onBlur={handleActualSave}
            onKeyDown={e => { if (e.key === "Enter") handleActualSave(); if (e.key === "Escape") setEditingActual(false); }}
            placeholder="0.5"
            type="number"
            step="0.5"
            min="0"
          />
        )}
        {linked && (
          <div className="calendar__linked-task">
            <Link2 size={12} className="calendar-icon" />
            <span className="calendar__linked-task-text">Linked to Calendar</span>
          </div>
        )}

        {deadline && !done && (
          <div className="task-card__tags">
            <span className="badge badge--deadline">ДЕДЛАЙН</span>
          </div>
        )}
      </div>
    </div>
  );
}
