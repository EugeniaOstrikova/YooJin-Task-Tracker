// Триместры — диапазоны недель (включительно)
// Неделя: воскресенье–суббота, формат "YYYYWnn"
export const TRIMESTERS = [
  {
    id: "T1-2026",
    label: "T1 · Май–Июль 2026",
    short: "T1",
    start: "2026W19",
    end:   "2026W31",
  },
  {
    id: "T2-2026",
    label: "T2 · Авг–Окт 2026",
    short: "T2",
    start: "2026W32",
    end:   "2026W44",
  },
  {
    id: "T3-2026",
    label: "T3 · Ноя 2026–Янв 2027",
    short: "T3",
    start: "2026W45",
    end:   "2027W04",
  },
  {
    id: "T4-2027",
    label: "T4 · Фев–Апр 2027",
    short: "T4",
    start: "2027W05",
    end:   "2027W17",
  },
];

// Найти триместр для конкретной недели
export function getTrimesterForWeek(weekId) {
  return TRIMESTERS.find(t => weekId >= t.start && weekId <= t.end) ?? null;
}
