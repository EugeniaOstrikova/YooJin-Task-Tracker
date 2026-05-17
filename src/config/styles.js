import { COLORS } from "./colors";

// ── Карточки ──────────────────────────────────────────
export const card = {
  base: {
    background:   COLORS.white,
    border:       `1px solid ${COLORS.border}`,
    borderRadius: 12,
    padding:      "14px 16px",
  },
  light: {
    background:   COLORS.bg,
    border:       `1px solid ${COLORS.border}`,
    borderRadius: 12,
    padding:      "14px 16px",
  },
};

// ── Кнопки ────────────────────────────────────────────
export const btn = {
  primary: {
    background:   COLORS.primary.darkest,
    color:        COLORS.white,
    border:       "none",
    borderRadius: 10,
    padding:      "8px 16px",
    fontSize:     13,
    fontWeight:   600,
    cursor:       "pointer",
    fontFamily:   "inherit",
  },
  secondary: {
    background:   COLORS.white,
    color:        COLORS.text.mid,
    border:       `1px solid ${COLORS.border}`,
    borderRadius: 10,
    padding:      "8px 16px",
    fontSize:     13,
    fontWeight:   500,
    cursor:       "pointer",
    fontFamily:   "inherit",
  },
  ghost: {
    background:   "transparent",
    color:        COLORS.text.light,
    border:       "none",
    padding:      "4px 8px",
    fontSize:     12,
    cursor:       "pointer",
    fontFamily:   "inherit",
  },
  active: {
    background:   COLORS.primary.light,
    color:        COLORS.primary.dark,
    border:       `1.5px solid ${COLORS.primary.base}`,
    borderRadius: 20,
    padding:      "5px 14px",
    fontSize:     12,
    fontWeight:   600,
    cursor:       "pointer",
    fontFamily:   "inherit",
  },
};

// ── Бейджи ────────────────────────────────────────────
export const badge = {
  base: {
    display:      "inline-flex",
    alignItems:   "center",
    borderRadius: 20,
    padding:      "2px 9px",
    fontSize:     11,
    fontWeight:   600,
    whiteSpace:   "nowrap",
  },
  primary: {
    background: COLORS.primary.light,
    color:      COLORS.primary.dark,
  },
  missed: {
    background: COLORS.missed.bg,
    color:      COLORS.missed.text,
  },
  late: {
    background: COLORS.late.bg,
    color:      COLORS.late.text,
  },
  cycle: {
    background: COLORS.cycle.bg,
    color:      COLORS.cycle.text,
  },
};

// ── Секционные заголовки ──────────────────────────────
export const sectionTitle = {
  base: {
    fontSize:      11,
    fontWeight:    700,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    marginBottom:  8,
  },
  primary: {
    color: COLORS.primary.dark,
  },
  faint: {
    color: COLORS.text.faint,
  },
};

// ── Прогресс-бар ──────────────────────────────────────
export const progressBar = {
  track: {
    height:       4,
    background:   COLORS.border,
    borderRadius: 4,
    overflow:     "hidden",
  },
  fill: (pct, done = false) => ({
    height:     "100%",
    borderRadius: 4,
    background: done ? COLORS.done.text : COLORS.primary.base,
    width:      `${pct}%`,
    transition: "width 0.3s",
  }),
};

// ── Модалки ───────────────────────────────────────────
export const modal = {
  overlay: {
    position:       "fixed",
    inset:          0,
    background:     "rgba(15,23,42,0.45)",
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    zIndex:         300,
    backdropFilter: "blur(2px)",
  },
  container: {
    background:   COLORS.white,
    borderRadius: 16,
    padding:      "20px 18px 28px",
    width:        "100%",
    maxWidth:     540,
    maxHeight:    "85vh",
    overflowY:    "auto",
  },
};

// ── Инпуты ────────────────────────────────────────────
export const input = {
  base: {
    width:        "100%",
    padding:      "8px 12px",
    borderRadius: 8,
    border:       `1px solid ${COLORS.border}`,
    fontSize:     13,
    outline:      "none",
    boxSizing:    "border-box",
    fontFamily:   "inherit",
    color:        COLORS.text.dark,
  },
};