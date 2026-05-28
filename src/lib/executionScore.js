import { getWeeksBetween, getCurrentWeekId, getNextWeekId } from "./weekUtils";

// Счёт одной тактики за неделю
export function calcTacticScore(tactic, weekTasks) {
  const taggedDone = weekTasks.filter(
    (t) => t.tactic_tag === tactic.tag && t.done
  );

  const { target_sessions, target_hours, target_count } = tactic;

  // sessions + hours
  if (target_sessions && target_hours) {
    const sessionsScore = Math.min(taggedDone.length / target_sessions, 1);
    const hoursScore = Math.min(
      taggedDone.reduce((s, t) => s + (t.actual_duration ?? 0), 0) /
        target_hours,
      1
    );
    return (sessionsScore + hoursScore) / 2;
  }

  // только часы
  if (target_hours) {
    const actual = taggedDone.reduce((s, t) => s + (t.actual_duration ?? 0), 0);
    return Math.min(actual / target_hours, 1);
  }

  // количество
  if (target_count) {
    return Math.min(taggedDone.length / target_count, 1);
  }

  // binary
  return taggedDone.length > 0 ? 1 : 0;
}

// Счёт недели (среднее по всем тактикам)
export function calcWeekScore(tactics, weekTasks) {
  if (!tactics.length) return null;
  const scores = tactics.map((t) => calcTacticScore(t, weekTasks));
  return scores.reduce((s, v) => s + v, 0) / scores.length;
}

// Execution Score главы
export function calcExecutionScore(chapter, tactics, tasks) {
  const currentWeek = getCurrentWeekId();
  const weeks = getWeeksBetween(chapter.start_week, getChapterEndWeek(chapter));

  const pastWeeks = weeks.filter((w) => w < currentWeek);
  if (!pastWeeks.length) return null;

  const weekScores = pastWeeks.map((weekId) => {
    const weekTasks = tasks.filter((t) => t.week === weekId);
    return calcWeekScore(tactics, weekTasks);
  });

  const passed = weekScores.filter((s) => s >= 0.85).length;
  return {
    score: weekScores.reduce((s, v) => s + v, 0) / weekScores.length,
    passed,
    total: pastWeeks.length,
    weekScores: weekScores.map((score, i) => ({ week: pastWeeks[i], score })),
  };
}

export function getChapterEndWeek(chapter) {
  let w = chapter.start_week;
  for (let i = 1; i < chapter.duration_weeks; i++) {
    w = getNextWeekId(w);
  }
  return w;
}
