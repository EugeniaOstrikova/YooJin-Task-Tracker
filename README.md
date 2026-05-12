# Трекер задач по неделям

## Запуск локально

```bash
npm install
npm run dev
```

По умолчанию данные хранятся в **localStorage** браузера.

---

## Подключение Supabase (облачное хранилище)

### 1. Создай проект на [supabase.com](https://supabase.com)

### 2. Создай таблицу `tasks`

В Supabase → SQL Editor вставь и выполни:

```sql
create table tasks (
  id          text primary key,
  week        text not null,
  day         text,
  cat         text not null,
  text        text not null,
  important   boolean default false,
  urgent      boolean default false,
  deadline    boolean default false,
  done        boolean default false,
  created_at  timestamptz default now()
);

-- Разрешить анонимный доступ (личное приложение)
alter table tasks enable row level security;
create policy "Allow all" on tasks for all using (true) with check (true);
```

### 3. Добавь переменные окружения

Скопируй `.env.example` → `.env`:

```bash
cp .env.example .env
```

Заполни значениями из Supabase → Project Settings → API:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

### 4. Деплой на Vercel

```bash
npm run build
# Задеплой папку dist на vercel.com
# Не забудь добавить VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY
# в Environment Variables на Vercel
```

---

## Формат JSON для импорта задач

```json
[
  {
    "id": "task_001",
    "week": "2026W20",
    "day": "2026-05-12",
    "cat": "music",
    "text": "Записать вокал",
    "important": false,
    "urgent": false,
    "deadline": false
  }
]
```

**Категории (cat):** `korea` · `music` · `finance` · `sport` · `health`

**Приоритет:**
- `important: true, urgent: true` → 🔴 важно и срочно
- `important: true, urgent: false` → 🟡 важно, не срочно
- `important: false, urgent: true` → 🟠 срочно, не важно

**Неделя (week):** формат `2026W19` — воскресенье–суббота.
Триместры: T1 `2026W19–2026W31`, T2 `2026W32–2026W44`, T3 `2026W45–2027W04`, T4 `2027W05–2027W17`

---

## Структура проекта

```
src/
  config/
    categories.js   — цвета категорий
    trimesters.js   — диапазоны триместров
    cycle.js        — настройки цикла
  lib/
    weekUtils.js    — математика недель (воскр–суббота)
    storage.js      — Supabase / localStorage
  hooks/
    useTasks.js     — CRUD задач
  components/
    shared/
      TopNav.jsx
      TaskCard.jsx
      CategoryTag.jsx
      PriorityIcon.jsx
      ImportModal.jsx
    WeekView/
      index.jsx
      DayColumn.jsx
    TrimesterView/
      index.jsx
      WeekBlock.jsx
  App.jsx
  main.jsx
```
