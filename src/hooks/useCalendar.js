import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./useAuth";
import { loadSettings, saveSettings } from "../lib/userSettingsStorage";
import {
  getGoogleAuthUrl,
  parseCodeFromUrl,
  exchangeCodeForTokens,
  refreshAccessToken,
  isTokenValid,
  fetchCalendarList,
  fetchEventsForWeek,
  parseEventTiming,
} from "../lib/googleCalendar";
import { getWeekStart, getWeekEnd } from "../lib/weekUtils";

export function useCalendar() {
  const { user } = useAuth();
  const [settings, setSettings] = useState({});
  const [calendars, setCalendars] = useState([]);
  const [connected, setConnected] = useState(false);
  const refreshTimer = useRef(null);

  const redirectUri = window.location.origin;

  // Загрузка настроек
  useEffect(() => {
    if (!user) return;
    loadSettings(user.id).then((s) => {
      setSettings(s);
      setConnected(isTokenValid(s));
    });
  }, [user]);

  // Поймать code из URL после OAuth redirect
  useEffect(() => {
    const code = parseCodeFromUrl();
    if (!code || !user) return;

    // Очистить URL
    window.history.replaceState({}, "", window.location.pathname);

    exchangeCodeForTokens(code, user.id, redirectUri)
      .then((result) => {
        if (result.success) {
          loadSettings(user.id).then((s) => {
            setSettings(s);
            setConnected(true);
          });
        }
      })
      .catch(console.error);
  }, [user]);

  // Автообновление токена
  useEffect(() => {
    if (!connected || !settings.google_token_expiry || !user) return;

    const msUntilExpiry = settings.google_token_expiry - Date.now() - 60000;
    if (msUntilExpiry <= 0) {
      // Обновить немедленно
      handleRefresh();
      return;
    }

    refreshTimer.current = setTimeout(handleRefresh, msUntilExpiry);
    return () => clearTimeout(refreshTimer.current);
  }, [connected, settings.google_token_expiry]);

  async function handleRefresh() {
    if (!user) return;
    try {
      const newToken = await refreshAccessToken(user.id);
      if (newToken) {
        const updated = await loadSettings(user.id);
        setSettings(updated);
      }
    } catch (e) {
      console.error("Token refresh failed:", e);
      setConnected(false);
    }
  }

  // Загрузить список календарей
  useEffect(() => {
    if (!connected || !settings.google_access_token) return;
    fetchCalendarList(settings.google_access_token)
      .then(setCalendars)
      .catch(console.error);
  }, [connected, settings.google_access_token]);

  // Переключить выбранный календарь
  const toggleCalendar = useCallback(
    async (calId) => {
      const current = settings.selected_calendars ?? [];
      const updated = current.includes(calId)
        ? current.filter((id) => id !== calId)
        : [...current, calId];
      await saveSettings(user.id, { selected_calendars: updated });
      setSettings((prev) => ({ ...prev, selected_calendars: updated }));
    },
    [settings, user]
  );

  // Получить события недели
  const getWeekEvents = useCallback(
    async (weekId) => {
      if (!settings.google_access_token) return [];
      const selected = settings.selected_calendars ?? [];
      if (!selected.length) return [];

      // Обновить токен если нужно
      let token = settings.google_access_token;
      if (!isTokenValid(settings) && user) {
        token = await refreshAccessToken(user.id);
        if (!token) return [];
      }

      const start = getWeekStart(weekId);
      const end = getWeekEnd(weekId);
      end.setDate(end.getDate() + 1);

      const allEvents = await Promise.all(
        selected.map((calId) =>
          fetchEventsForWeek(token, calId, start, end).catch(() => [])
        )
      );

      return allEvents.flat().map((e) => {
        const { time, durationHours } = parseEventTiming(e.start, e.end);
        return {
          id: e.id,
          title: e.summary ?? "(без названия)",
          time,
          durationHours,
          date: e.start?.date ?? e.start?.dateTime?.split("T")[0],
          allDay: !!e.start?.date,
        };
      });
    },
    [settings, user]
  );

  return {
    connected,
    calendars,
    selectedCalendars: settings.selected_calendars ?? [],
    toggleCalendar,
    getWeekEvents,
    connectUrl: getGoogleAuthUrl(redirectUri),
  };
}
