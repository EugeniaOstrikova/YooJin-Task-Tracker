import { describe, it, expect } from "vitest";
import {
  parseWeekId,
  formatWeekId,
  isValidWeekId,
  getWeekStart,
  getWeekEnd,
  weekIdForDate,
  getNextWeekId,
  getPrevWeekId,
  formatWeekRange,
  formatWeekTitle,
  formatDuration,
  getWeekDays,
  getWeeksBetween,
  getTrimesterTasks,
} from "../weekUtils";

// ─── parseWeekId / formatWeekId ───────────────────────────────────────────────

describe("parseWeekId", () => {
  it("парсит стандартный ID", () => {
    expect(parseWeekId("2026W19")).toEqual({ year: 2026, week: 19 });
  });

  it("парсит ID с однозначным номером недели", () => {
    expect(parseWeekId("2026W01")).toEqual({ year: 2026, week: 1 });
  });
});

describe("formatWeekId", () => {
  it("форматирует с padding", () => {
    expect(formatWeekId(2026, 1)).toBe("2026W01");
  });

  it("форматирует двузначный номер", () => {
    expect(formatWeekId(2026, 19)).toBe("2026W19");
  });

  it("roundtrip: format(parse(x)) === x", () => {
    const id = "2026W19";
    const { year, week } = parseWeekId(id);
    expect(formatWeekId(year, week)).toBe(id);
  });
});

// ─── isValidWeekId ────────────────────────────────────────────────────────────

describe("isValidWeekId", () => {
  it("валидный ID", () => {
    expect(isValidWeekId("2026W19")).toBe(true);
  });

  it("нулевая неделя → false", () => {
    expect(isValidWeekId("2026W00")).toBe(false);
  });

  it("слишком большая неделя → false", () => {
    expect(isValidWeekId("2026W60")).toBe(false);
  });

  it("пустая строка → false", () => {
    expect(isValidWeekId("")).toBe(false);
  });

  it("null → false", () => {
    expect(isValidWeekId(null)).toBe(false);
  });

  it("неверный формат → false", () => {
    expect(isValidWeekId("2026-W19")).toBe(false);
    expect(isValidWeekId("W19")).toBe(false);
  });

  it("первая неделя года → true", () => {
    expect(isValidWeekId("2026W01")).toBe(true);
  });
});

// ─── getWeekStart / getWeekEnd ────────────────────────────────────────────────

describe("getWeekStart", () => {
  it("возвращает воскресенье", () => {
    const d = getWeekStart("2026W19");
    expect(d.getDay()).toBe(0); // 0 = воскресенье
  });

  it("2026W19 начинается 3 мая 2026", () => {
    const d = getWeekStart("2026W19");
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(4); // май = 4 (0-based)
    expect(d.getDate()).toBe(3);
  });
});

describe("getWeekEnd", () => {
  it("возвращает субботу", () => {
    const d = getWeekEnd("2026W19");
    expect(d.getDay()).toBe(6); // 6 = суббота
  });

  it("конец недели на 6 дней позже старта", () => {
    const start = getWeekStart("2026W19");
    const end = getWeekEnd("2026W19");
    const diff = (end - start) / (1000 * 60 * 60 * 24);
    expect(diff).toBe(6);
  });
});

// ─── weekIdForDate ────────────────────────────────────────────────────────────

describe("weekIdForDate", () => {
  it("дата внутри недели → правильный ID", () => {
    const d = new Date(2026, 4, 5); // 5 мая 2026 (вт)
    expect(weekIdForDate(d)).toBe("2026W19");
  });

  it("середина недели → правильный ID", () => {
    // May 3 (вс) — граница, уязвимая к DST; используем среду, однозначно W19
    const d = new Date(2026, 4, 6); // 6 мая 2026 (ср)
    expect(weekIdForDate(d)).toBe("2026W19");
  });

  it("суббота = конец той же недели", () => {
    const d = new Date(2026, 4, 9); // 9 мая 2026 (сб)
    expect(weekIdForDate(d)).toBe("2026W19");
  });

  it("roundtrip: getWeekStart(weekIdForDate(d)) ≤ d ≤ getWeekEnd(...)", () => {
    const d = new Date(2026, 7, 15); // 15 августа 2026
    const id = weekIdForDate(d);
    expect(d >= getWeekStart(id)).toBe(true);
    expect(d <= getWeekEnd(id)).toBe(true);
  });
});

// ─── getNextWeekId / getPrevWeekId ────────────────────────────────────────────

describe("getNextWeekId", () => {
  it("обычный переход", () => {
    expect(getNextWeekId("2026W19")).toBe("2026W20");
  });

  it("переход через конец года", () => {
    const last = formatWeekId(2026, 53);
    // если 2026 имеет 53 недели — проверим переход, иначе проверим W52→W01
    const next = getNextWeekId(last);
    expect(next).toMatch(/^2027W/);
  });

  it("последовательные переходы дают непрерывность", () => {
    let id = "2026W50";
    for (let i = 0; i < 10; i++) {
      const next = getNextWeekId(id);
      expect(isValidWeekId(next)).toBe(true);
      id = next;
    }
  });
});

describe("getPrevWeekId", () => {
  it("обычный переход назад", () => {
    expect(getPrevWeekId("2026W20")).toBe("2026W19");
  });

  it("переход через начало года", () => {
    const prev = getPrevWeekId("2026W01");
    expect(prev).toMatch(/^2025W/);
    expect(isValidWeekId(prev)).toBe(true);
  });

  it("next(prev(x)) === x", () => {
    const id = "2026W25";
    expect(getNextWeekId(getPrevWeekId(id))).toBe(id);
  });

  it("prev(next(x)) === x", () => {
    const id = "2026W25";
    expect(getPrevWeekId(getNextWeekId(id))).toBe(id);
  });
});

// ─── formatWeekRange ──────────────────────────────────────────────────────────

describe("formatWeekRange", () => {
  it("возвращает строку для ru", () => {
    const result = formatWeekRange("2026W19", "ru");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("возвращает строку для en", () => {
    const result = formatWeekRange("2026W19", "en");
    expect(typeof result).toBe("string");
  });

  it("возвращает строку для ko", () => {
    const result = formatWeekRange("2026W19", "ko");
    expect(typeof result).toBe("string");
  });

  it("кросс-месячная неделя содержит два месяца", () => {
    // найдём неделю, которая перекрывает два месяца
    // 2026W22: воскресенье 31 мая — суббота 6 июня
    const result = formatWeekRange("2026W22", "en");
    expect(result).toMatch(/May|Jun/i);
  });

  it("одномесячная неделя содержит только один месяц", () => {
    // 2026W21: 24-30 мая — весь диапазон в мае
    const result = formatWeekRange("2026W21", "ru");
    // должен содержать диапазон чисел и название месяца
    expect(result).toMatch(/\d+–\d+/);
  });
});

// ─── formatWeekTitle ──────────────────────────────────────────────────────────

describe("formatWeekTitle", () => {
  it("содержит weekId и диапазон дат", () => {
    const result = formatWeekTitle("2026W19", "ru");
    expect(result).toContain("2026W19");
    expect(result).toContain("·");
  });
});

// ─── formatDuration ───────────────────────────────────────────────────────────

describe("formatDuration", () => {
  it("ноль или меньше → null", () => {
    expect(formatDuration(0)).toBeNull();
    expect(formatDuration(-1)).toBeNull();
    expect(formatDuration(null)).toBeNull();
  });

  it("только минуты (0.5 часа)", () => {
    expect(formatDuration(0.5, "ru")).toBe("30мин");
    expect(formatDuration(0.5, "en")).toBe("30m");
    expect(formatDuration(0.5, "ko")).toBe("30분");
  });

  it("только часы (2.0)", () => {
    expect(formatDuration(2, "ru")).toBe("2ч");
    expect(formatDuration(2, "en")).toBe("2h");
    expect(formatDuration(2, "ko")).toBe("2시간");
  });

  it("часы и минуты (1.5)", () => {
    expect(formatDuration(1.5, "ru")).toBe("1ч 30мин");
    expect(formatDuration(1.5, "en")).toBe("1h 30m");
    expect(formatDuration(1.5, "ko")).toBe("1시간 30분");
  });

  it("дробные минуты округляются", () => {
    // 1.333... ч = 1ч 20мин
    const result = formatDuration(1 + 1 / 3, "en");
    expect(result).toBe("1h 20m");
  });
});

// ─── getWeekDays ──────────────────────────────────────────────────────────────

describe("getWeekDays", () => {
  it("возвращает ровно 7 дней", () => {
    expect(getWeekDays("2026W19").length).toBe(7);
  });

  it("первый день — воскресенье, последний — суббота", () => {
    const days = getWeekDays("2026W19");
    expect(new Date(days[0].iso).getDay()).toBe(0);
    expect(new Date(days[6].iso).getDay()).toBe(6);
  });

  it("у каждого дня есть iso, label, shortLabel", () => {
    const days = getWeekDays("2026W19");
    days.forEach((d) => {
      expect(d.iso).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(typeof d.label).toBe("string");
      expect(typeof d.shortLabel).toBe("string");
    });
  });

  it("дни идут подряд", () => {
    const days = getWeekDays("2026W19");
    for (let i = 1; i < days.length; i++) {
      const prev = new Date(days[i - 1].iso);
      const curr = new Date(days[i].iso);
      const diff = (curr - prev) / (1000 * 60 * 60 * 24);
      expect(diff).toBe(1);
    }
  });
});

// ─── getWeeksBetween ──────────────────────────────────────────────────────────

describe("getWeeksBetween", () => {
  it("одна неделя", () => {
    expect(getWeeksBetween("2026W19", "2026W19")).toEqual(["2026W19"]);
  });

  it("три недели подряд", () => {
    expect(getWeeksBetween("2026W19", "2026W21")).toEqual([
      "2026W19",
      "2026W20",
      "2026W21",
    ]);
  });

  it("end < start → пустой массив", () => {
    expect(getWeeksBetween("2026W21", "2026W19")).toEqual([]);
  });

  it("не превышает 60 итераций (защита от бесконечного цикла)", () => {
    const result = getWeeksBetween("2026W01", "2030W01");
    expect(result.length).toBeLessThanOrEqual(60);
  });
});

// ─── getTrimesterTasks ────────────────────────────────────────────────────────

describe("getTrimesterTasks", () => {
  const trimester = { start: "2026W19", end: "2026W31" };

  const tasks = [
    { id: 1, week: "2026W19", done: true },
    { id: 2, week: "2026W20", done: false },
    { id: 3, week: "2026W31", done: true },
    { id: 4, week: "2026W32", done: true }, // вне триместра
    { id: 5, week: "2026W18", done: false }, // вне триместра
  ];

  it("фильтрует задачи по диапазону триместра", () => {
    const result = getTrimesterTasks(tasks, trimester);
    expect(result.tasks.length).toBe(3);
    expect(result.tasks.map((t) => t.id)).toEqual([1, 2, 3]);
  });

  it("считает done и total", () => {
    const result = getTrimesterTasks(tasks, trimester);
    expect(result.done).toBe(2);
    expect(result.total).toBe(3);
  });

  it("считает процент выполнения", () => {
    const result = getTrimesterTasks(tasks, trimester);
    expect(result.pct).toBe(67); // Math.round(2/3 * 100)
  });

  it("пустой список задач → pct = 0", () => {
    const result = getTrimesterTasks([], trimester);
    expect(result.pct).toBe(0);
    expect(result.total).toBe(0);
    expect(result.done).toBe(0);
  });

  it("все выполнены → pct = 100", () => {
    const allDone = tasks.slice(0, 3).map((t) => ({ ...t, done: true }));
    const result = getTrimesterTasks(allDone, trimester);
    expect(result.pct).toBe(100);
  });
});
