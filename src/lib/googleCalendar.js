const CLIENT_ID     = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCOPES        = "https://www.googleapis.com/auth/calendar.readonly";
const REDIRECT_URI  = window.location.origin;

// ── OAuth ─────────────────────────────────────────────

export function getGoogleAuthUrl() {
  const params = new URLSearchParams({
    client_id:     CLIENT_ID,
    redirect_uri:  REDIRECT_URI,
    response_type: "token",
    scope:         SCOPES,
    prompt:        "consent",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export function parseTokenFromHash() {
  const hash   = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  const token  = params.get("access_token");
  const expiry = params.get("expires_in");
  if (!token) return null;
  return {
    access_token:  token,
    expiry_time:   Date.now() + parseInt(expiry) * 1000,
  };
}

export function isTokenValid(settings) {
  return !!(settings?.google_access_token && 
    settings?.google_token_expiry > Date.now());
}

// ── Calendar API ──────────────────────────────────────

export async function fetchCalendarList(accessToken) {
  const res = await fetch(
    "https://www.googleapis.com/calendar/v3/users/me/calendarList",
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const data = await res.json();
  return data.items ?? [];
}

export async function fetchEventsForWeek(accessToken, calendarId, weekStart, weekEnd) {
  const params = new URLSearchParams({
    timeMin:      weekStart.toISOString(),
    timeMax:      weekEnd.toISOString(),
    singleEvents: "true",
    orderBy:      "startTime",
  });
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const data = await res.json();
  return data.items ?? [];
}

// export function formatEventDuration(start, end) {
//   if (!start?.dateTime) return "весь день";
//   const s   = new Date(start.dateTime);
//   const e   = new Date(end.dateTime);
//   const min = Math.round((e - s) / 60000);
//   const h   = Math.floor(min / 60);
//   const m   = min % 60;
//   const time = s.toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" });
//   const dur  = h > 0 ? (m > 0 ? `${h}ч ${m}мин` : `${h}ч`) : `${m}мин`;
//   return `${time} · ${dur}`;
// }

export function parseEventTiming(start, end) {
  if (!start?.dateTime) return { time: "весь день", duration: null };
  const s      = new Date(start.dateTime);
  const e      = new Date(end.dateTime);
  const min    = Math.round((e - s) / 60000);
  const hours  = min / 60;
  const time   = s.toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" });
  return { time, durationHours: hours };
}