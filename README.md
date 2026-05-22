# Gentle Planner

Бережный планировщик задач по неделям и триместрам. Помогает отслеживать цели, анализировать прогресс и адаптировать план под себя — без давления и самокритики.

## Возможности

- **Недельный вид** — задачи по дням (воскресенье–суббота), перетаскивание задач между днями
- **Триместровый вид** — обзор всех недель в рамках триместра (T1–T4)
- **Трекер привычек** — отметка выполнения привычек по дням недели
- **Цели на неделю** — до 3 целей с отметкой выполнения
- **Статистика** — bar-чарты выполнения задач по категориям в разрезе триместра
- **Ревью** — список пропущенных и просроченных задач с возможностью добавить тему и заметку
- **Импорт / Экспорт** — загрузка и выгрузка задач в формате JSON
- **Интеграция с Google Calendar** — связка событий календаря с задачами
- **Аутентификация** — вход по email/паролю через Supabase Auth
- **Локализация** — русский, английский, корейский (переключается в настройках)
- **Кастомные категории** — добавление и настройка своих категорий задач

## Технологии

| Слой | Библиотека |
|------|-----------|
| UI | React 18, Vite |
| Стилизация | CSS Variables, Lucide React |
| База данных / Auth | Supabase |
| Графики | Recharts |
| Drag & Drop | @dnd-kit/core |
| Локализация | react-i18next |

## Приоритет задач (матрица Эйзенхауэра)

| important | urgent | Значение |
|-----------|--------|----------|
| `true` | `true` | Важно и срочно |
| `true` | `false` | Важно, не срочно |
| `false` | `true` | Срочно, не важно |
| `false` | `false` | Не важно и не срочно |

## Триместры

Формат недели: `YYYYWnn` (начало — воскресенье).

| Триместр | Период | Диапазон недель |
|----------|--------|-----------------|
| T1 | Май–Июль 2026 | `2026W19` – `2026W31` |
| T2 | Авг–Окт 2026 | `2026W32` – `2026W44` |
| T3 | Ноя 2026–Янв 2027 | `2026W45` – `2027W04` |
| T4 | Фев–Апр 2027 | `2027W05` – `2027W17` |

---

## Структура проекта

```
src/
  config/
    categories.js      — цвета и метки категорий
    trimesters.js      — диапазоны и утилиты триместров
    cycle.js           — настройки цикла
    colors.js          — цветовые токены
    styles.js          — общие стили
  lib/
    weekUtils.js       — математика недель (Sun–Sat)
    storage.js         — CRUD задач (Supabase / localStorage)
    habitStorage.js    — CRUD привычек и логов
    weekGoalsStorage.js — CRUD целей на неделю
    themesStorage.js   — CRUD тем для ревью
    categoriesStorage.js — пользовательские категории
    userSettingsStorage.js — настройки пользователя
    auth.js            — Supabase Auth
    googleCalendar.js  — OAuth и API Google Calendar
  hooks/
    useTasks.js        — CRUD + экспорт задач
    useHabits.js       — привычки и еженедельные логи
    useWeekGoals.js    — цели на неделю
    useThemes.js       — темы для ревью
    useCalendar.js     — Google Calendar
    useAuth.js         — состояние аутентификации
  context/
    CategoriesContext.jsx — глобальные категории
  components/
    Auth/
      LoginScreen.jsx
    WeekView/
      index.jsx        — недельный вид с навигацией
      DayColumn.jsx    — колонка одного дня
      HabitTracker.jsx — трекер привычек
      WeekGoals.jsx    — цели на неделю
    TrimesterView/
      index.jsx        — обзор триместра
      WeekBlock.jsx    — блок одной недели
    StatsView/
      index.jsx        — графики выполнения
    ReviewView/
      index.jsx        — ревью пропущенных задач
    shared/
      TopNav.jsx
      TaskCard.jsx
      CategoryTag.jsx
      PriorityIcon.jsx
      ColorLegend.jsx
      ImportModal.jsx
      TaskEditModal.jsx
      SettingsModal.jsx
  i18n/
    index.js           — конфигурация i18next
    locales/ru.json
    locales/en.json
    locales/ko.json
  App.jsx
  main.jsx
```
