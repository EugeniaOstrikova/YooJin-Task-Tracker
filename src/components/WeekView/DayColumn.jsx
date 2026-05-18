import { useState } from "react"; 
import TaskCard from "../shared/TaskCard";
import { formatDuration } from "../../lib/weekUtils";
import { Calendar, Link2, X } from "lucide-react";

export default function DayColumn({ day, tasks, onToggle, calEvents = [], onUpdateTask }) {
  const { shortLabel, isToday } = day;
  const [linkingEventId, setLinkingEventId] = useState(null);

  // const totalHours = tasks.reduce((sum, t) => sum + (t.duration ?? 0), 0);
  // const totalLabel = formatDuration(totalHours);

  // ── Подсчёт времени ───────────────────────────────────
  let totalHours = 0;
  
  // Ненавязанные задачи
  tasks.filter(t => !t.linked_event_id)
    .forEach(t => { totalHours += t.duration ?? 0; });

  // События: связанные → max(event, task), несвязанные → event duration
  calEvents.forEach(e => {
    const linked = tasks.find(t => t.linked_event_id === e.id);
    if (linked) {
      totalHours += Math.max(linked.duration ?? 0, e.durationHours ?? 0);
    } else {
      totalHours += e.durationHours ?? 0;
    }
  });

  const totalLabel = formatDuration(totalHours);

  // ── Привязать задачу к событию ────────────────────────
  function handleLink(taskId, eventId) {
    onUpdateTask(taskId, { linked_event_id: eventId });
    setLinkingEventId(null);
  }

  function handleUnlink(taskId) {
    onUpdateTask(taskId, { linked_event_id: null });
  }

  const linkedTaskIds = new Set(
    tasks.filter(t => t.linked_event_id).map(t => t.id)
  );

//  return (
//     <div className={`day-col${isToday ? " day-col--today" : ""}`}>

//       {/* Заголовок */}
//       <div className={`day-col__header${isToday ? " day-col__header--today" : ""}`}>
//         {shortLabel}
//         {isToday && <span className="badge badge--today">сегодня</span>}
//       </div>

//       {/* Задачи */}
//       {tasks.length === 0
//         ? <div className="empty">—</div>
//         : tasks.map(t => (
//             <div key={t.id}>
//               <TaskCard
//                 task={t}
//                 onToggle={onToggle}
//                 className={linkedTaskIds.has(t.id) ? "task-card--linked-to-event" : ""}
//               />
//               {t.linked_event_id && (
//                 <div className="task-card__event-badge">📅 привязано к событию</div>
//               )}
//             </div>
//           ))
//       }

//       {/* Итого времени */}
//       {totalLabel && (
//         <div className="day-col__footer">총 {totalLabel}</div>
//       )}

//       {/* События Google Calendar */}
//       {calEvents.length > 0 && (
//         <div className="day-col__calendar">
//           {calEvents.map(e => {
//             const linkedTask = tasks.find(t => t.linked_event_id === e.id);
//             const isLinking  = linkingEventId === e.id;
//             const unlinkableTasks = tasks.filter(t => !t.linked_event_id || t.linked_event_id === e.id);

//             return (
//               <div key={e.id} className={`cal-event${linkedTask ? " cal-event--linked" : ""}`}>
//                 <Calendar size={14} className="cal-event__icon" color="var(--c-dim)" />

//                 <div className="cal-event__body">
//                   <div className="cal-event__title">{e.title}</div>
//                   {e.time && <div className="cal-event__time">{e.time}</div>}

//                   {/* Привязанная задача */}
//                   {linkedTask && (
//                     <div className="cal-event__linked-task">
//                       <Link2 size={10} />
//                       {linkedTask.text}
//                       <button onClick={() => handleUnlink(linkedTask.id)}>
//                         <X size={10} />
//                       </button>
//                     </div>
//                   )}

//                   {/* Выбор задачи для привязки */}
//                   {isLinking && (
//                     <select
//                       className="cal-event__link-select"
//                       defaultValue=""
//                       onChange={e2 => e2.target.value && handleLink(e2.target.value, e.id)}
//                     >
//                       <option value="">— выбери задачу —</option>
//                       {unlinkableTasks.map(t => (
//                         <option key={t.id} value={t.id}>{t.text}</option>
//                       ))}
//                     </select>
//                   )}
//                 </div>

//                 {/* Длительность */}
//                 {e.durationHours && (
//                   <span className="cal-event__dur">
//                     {formatDuration(e.durationHours)}
//                   </span>
//                 )}

//                 {/* Кнопка привязки */}
//                 {!linkedTask && (
//                   <button
//                     className="cal-event__link-btn"
//                     onClick={() => setLinkingEventId(isLinking ? null : e.id)}
//                   >
//                     {isLinking ? "✕" : "привязать"}
//                   </button>
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );

  return (
    <div className={`day-col${isToday ? " day-col--today" : ""}`}>
      <div className={`day-col__header${isToday ? " day-col__header--today" : ""}`}>
        {shortLabel}
        {isToday && <span className="badge badge--today">сегодня</span>}
      </div>

      {tasks.length === 0
        ? <div className="empty">—</div>
        : tasks.map(t => 
          <TaskCard 
            key={t.id} 
            task={t} 
            onToggle={onToggle} 
            linked={t.linked_event_id ? true : false}
          />)
      }

      {/* События Google Calendar */}
      {calEvents.length > 0 && (
        <div className="day-col__calendar">
          {calEvents.map(e => {
            const linkedTask = tasks.find(t => t.linked_event_id === e.id);
            const isLinking  = linkingEventId === e.id;
            const unlinkableTasks = tasks.filter(t => !t.linked_event_id || t.linked_event_id === e.id);

            return (
              <div key={e.id} className="calendar-card">
                <div className="calendar-card__content">
                  <Calendar size={14} className="calendar-icon" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="calendar-card__name">
                      <span className="calendar-card__text">{e.title}</span>
                      {!linkedTask && (
                        isLinking ? (
                          <X size={14} className="calendar-icon" onClick={() => setLinkingEventId(isLinking ? null : e.id)}/>
                        ) : (
                          <Link2 size={14} className="calendar-icon" onClick={() => setLinkingEventId(isLinking ? null : e.id)} />
                        )
                      )}
                    </div>
                    {e.time && (
                      <div className="task-card__dur">{e.time}</div>
                    )}
                    {linkedTask && (
                      <div className="calendar__linked-task">
                        <Link2 size={12} className="calendar-icon" />
                        <span className="calendar__linked-task-text">{linkedTask.text}</span>
                        <X size={12} className="calendar-icon" onClick={() => handleUnlink(linkedTask.id)} />
                      </div>
                    )}
                    {isLinking && (
                      <select
                        className="cal-event__link-select"
                        defaultValue=""
                        onChange={e2 => e2.target.value && handleLink(e2.target.value, e.id)}
                      >
                        <option value="">— выбери задачу —</option>
                        {unlinkableTasks.map(t => (
                          <option key={t.id} value={t.id}>{t.text}</option>
                        ))}
                      </select>
                    )}
                  </div>
                  {e.durationHours && (
                    <span className="task-card__dur">{formatDuration(e.durationHours)}</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {totalLabel && (
        <div className="day-col__footer">총 {totalLabel}</div>
      )}
    </div>
  );
}

// ---------
// import { useState } from "react";
// import { Calendar, Link2, X } from "lucide-react";
// import TaskCard       from "../shared/TaskCard";
// import { formatDuration } from "../../lib/weekUtils";

// export default function DayColumn({ day, tasks, onToggle, calEvents = [], onUpdateTask }) {
//   const { shortLabel, isToday } = day;
//   const [linkingEventId, setLinkingEventId] = useState(null);

//   // ── Подсчёт времени ───────────────────────────────────
//   let totalHours = 0;

//   // Ненавязанные задачи
//   tasks.filter(t => !t.linked_event_id)
//     .forEach(t => { totalHours += t.duration ?? 0; });

//   // События: связанные → max(event, task), несвязанные → event duration
//   calEvents.forEach(e => {
//     const linked = tasks.find(t => t.linked_event_id === e.id);
//     if (linked) {
//       totalHours += Math.max(linked.duration ?? 0, e.durationHours ?? 0);
//     } else {
//       totalHours += e.durationHours ?? 0;
//     }
//   });

//   const totalLabel = formatDuration(totalHours);

//   // ── Привязать задачу к событию ────────────────────────
//   function handleLink(taskId, eventId) {
//     onUpdateTask(taskId, { linked_event_id: eventId });
//     setLinkingEventId(null);
//   }

//   function handleUnlink(taskId) {
//     onUpdateTask(taskId, { linked_event_id: null });
//   }

//   const linkedTaskIds = new Set(
//     tasks.filter(t => t.linked_event_id).map(t => t.id)
//   );

//   return (
//     <div className={`day-col${isToday ? " day-col--today" : ""}`}>

//       {/* Заголовок */}
//       <div className={`day-col__header${isToday ? " day-col__header--today" : ""}`}>
//         {shortLabel}
//         {isToday && <span className="badge badge--today">сегодня</span>}
//       </div>

//       {/* Задачи */}
//       {tasks.length === 0
//         ? <div className="empty">—</div>
//         : tasks.map(t => (
//             <div key={t.id}>
//               <TaskCard
//                 task={t}
//                 onToggle={onToggle}
//                 className={linkedTaskIds.has(t.id) ? "task-card--linked-to-event" : ""}
//               />
//               {t.linked_event_id && (
//                 <div className="task-card__event-badge">📅 привязано к событию</div>
//               )}
//             </div>
//           ))
//       }

//       {/* Итого времени */}
//       {totalLabel && (
//         <div className="day-col__footer">총 {totalLabel}</div>
//       )}

//       {/* События Google Calendar */}
//       {calEvents.length > 0 && (
//         <div className="day-col__calendar">
//           {calEvents.map(e => {
//             const linkedTask = tasks.find(t => t.linked_event_id === e.id);
//             const isLinking  = linkingEventId === e.id;
//             const unlinkableTasks = tasks.filter(t => !t.linked_event_id || t.linked_event_id === e.id);

//             return (
//               <div key={e.id} className={`cal-event${linkedTask ? " cal-event--linked" : ""}`}>
//                 <Calendar size={14} className="cal-event__icon" color="var(--c-dim)" />

//                 <div className="cal-event__body">
//                   <div className="cal-event__title">{e.title}</div>
//                   {e.time && <div className="cal-event__time">{e.time}</div>}

//                   {/* Привязанная задача */}
//                   {linkedTask && (
//                     <div className="cal-event__linked-task">
//                       <Link2 size={10} />
//                       {linkedTask.text}
//                       <button onClick={() => handleUnlink(linkedTask.id)}>
//                         <X size={10} />
//                       </button>
//                     </div>
//                   )}

//                   {/* Выбор задачи для привязки */}
//                   {isLinking && (
//                     <select
//                       className="cal-event__link-select"
//                       defaultValue=""
//                       onChange={e2 => e2.target.value && handleLink(e2.target.value, e.id)}
//                     >
//                       <option value="">— выбери задачу —</option>
//                       {unlinkableTasks.map(t => (
//                         <option key={t.id} value={t.id}>{t.text}</option>
//                       ))}
//                     </select>
//                   )}
//                 </div>

//                 {/* Длительность */}
//                 {e.durationHours && (
//                   <span className="cal-event__dur">
//                     {formatDuration(e.durationHours)}
//                   </span>
//                 )}

//                 {/* Кнопка привязки */}
//                 {!linkedTask && (
//                   <button
//                     className="cal-event__link-btn"
//                     onClick={() => setLinkingEventId(isLinking ? null : e.id)}
//                   >
//                     {isLinking ? "✕" : "привязать"}
//                   </button>
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// }