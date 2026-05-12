import { CYCLE_START, CYCLE_LENGTH } from "../config/cycle";

const RU_MONTHS_SHORT = ["янв","фев","мар","апр","май","июн","июл","авг","сен","окт","ноя","дек"];
const RU_MONTHS_FULL  = ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];
const RU_DAYS_SHORT   = ["вс","пн","вт","ср","чт","пт","сб"];

// ─── Базовые утилиты ─────────────────────────────────────────────────────────

/** Первое воскресенье данного года */
function firstSundayOfYear(year) {
  const jan1 = new Date(year, 0, 1);
  const day  = jan1.getDay(); // 0=Вс
  return new Date(year, 0, 1 - day); // воскресенье недели, содержащей Jan 1
}

/** Количество воскресных недель в году */
function weeksInYear(year) {
  const fs  = firstSundayOfYear(year);
  const fsN = firstSundayOfYear(year + 1);
  return Math.round((fsN - fs) / (7 * 86400000));
}

// Локальная дата без конвертации в UTC
function toLocalISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// ─── Парсинг / форматирование ID ─────────────────────────────────────────────

/** "2026W19" → { year: 2026, week: 19 } */
export function parseWeekId(weekId) {
  const [y, w] = weekId.split("W");
  return { year: parseInt(y), week: parseInt(w) };
}

/** { year, week } → "2026W19" */
export function formatWeekId(year, week) {
  return `${year}W${String(week).padStart(2, "0")}`;
}

/** Проверка формата */
export function isValidWeekId(str) {
  if (!str || typeof str !== "string") return false;
  if (!/^\d{4}W\d{1,2}$/.test(str)) return false;
  const { year, week } = parseWeekId(str);
  return week >= 1 && week <= weeksInYear(year);
}

// ─── Даты недели ──────────────────────────────────────────────────────────────

/** "2026W19" → Date (воскресенье, начало недели) */
export function getWeekStart(weekId) {
  const { year, week } = parseWeekId(weekId);
  const fs  = firstSundayOfYear(year);
  const d   = new Date(fs);
  d.setDate(fs.getDate() + (week - 1) * 7);
  return d;
}

/** "2026W19" → Date (суббота, конец недели) */
export function getWeekEnd(weekId) {
  const start = getWeekStart(weekId);
  const end   = new Date(start);
  end.setDate(start.getDate() + 6);
  return end;
}

/** Date → "2026W19" */
export function weekIdForDate(date) {
  const year = date.getFullYear();
  const fs   = firstSundayOfYear(year);

  if (date < fs) {
    const prevWeeks = weeksInYear(year - 1);
    return formatWeekId(year - 1, prevWeeks);
  }
  const diff = Math.floor((date - fs) / (7 * 86400000));
  return formatWeekId(year, diff + 1);
}

/** Текущая неделя */
export function getCurrentWeekId() {
  return weekIdForDate(new Date());
}

// ─── Навигация ────────────────────────────────────────────────────────────────

export function getNextWeekId(weekId) {
  const { year, week } = parseWeekId(weekId);
  if (week >= weeksInYear(year)) return formatWeekId(year + 1, 1);
  return formatWeekId(year, week + 1);
}

export function getPrevWeekId(weekId) {
  const { year, week } = parseWeekId(weekId);
  if (week <= 1) return formatWeekId(year - 1, weeksInYear(year - 1));
  return formatWeekId(year, week - 1);
}

// ─── Цикл ─────────────────────────────────────────────────────────────────────

/** Является ли данная неделя неделей цикла */
export function isCycleWeek(weekId) {
  const start   = getWeekStart(CYCLE_START);
  const current = getWeekStart(weekId);
  const diffWeeks = Math.round((current - start) / (7 * 86400000));
  return diffWeeks >= 0 && diffWeeks % CYCLE_LENGTH === 0;
}

// ─── Форматирование ───────────────────────────────────────────────────────────

/** "2026W19" → "10–16 мая" */
export function formatWeekRange(weekId) {
  const s = getWeekStart(weekId);
  const e = getWeekEnd(weekId);
  if (s.getMonth() === e.getMonth()) {
    return `${s.getDate()}–${e.getDate()} ${RU_MONTHS_SHORT[s.getMonth()]}`;
  }
  return `${s.getDate()} ${RU_MONTHS_SHORT[s.getMonth()]}–${e.getDate()} ${RU_MONTHS_SHORT[e.getMonth()]}`;
}

/** Полный заголовок недели: "2026W19 · 10–16 мая 2026" */
export function formatWeekTitle(weekId) {
  return `${weekId} · ${formatWeekRange(weekId)}`;
}

/** Получить 7 дней недели с датами */
export function getWeekDays(weekId) {
  const start = getWeekStart(weekId);
  return Array.from({ length: 7 }, (_, i) => {
    const d   = new Date(start);
    d.setDate(start.getDate() + i);
    const iso = toLocalISO(d);
    return {
      iso,
      label:      `${RU_DAYS_SHORT[d.getDay()]} ${d.getDate()} ${RU_MONTHS_SHORT[d.getMonth()]}`,
      shortLabel: `${RU_DAYS_SHORT[d.getDay()]} ${d.getDate()}`,
      dayName:    RU_DAYS_SHORT[d.getDay()],
      date:       d.getDate(),
      month:      RU_MONTHS_SHORT[d.getMonth()],
      isToday: iso === toLocalISO(new Date()),
    };
  });
}

/** Все недели между start и end (включительно) */
export function getWeeksBetween(startWeekId, endWeekId) {
  const weeks = [];
  let cur = startWeekId;
  // Защита от бесконечного цикла: не более 60 недель
  for (let i = 0; i < 60 && cur <= endWeekId; i++) {
    weeks.push(cur);
    cur = getNextWeekId(cur);
  }
  return weeks;
}

/** Месяц + год для заголовка группы */
export function getMonthLabel(weekId) {
  const s = getWeekStart(weekId);
  return `${RU_MONTHS_FULL[s.getMonth()]} ${s.getFullYear()}`;
}

