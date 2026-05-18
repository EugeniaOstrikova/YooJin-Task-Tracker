import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import { loadSettings, saveSettings } from "../lib/userSettingsStorage";
import {
  parseTokenFromHash, isTokenValid,
  fetchCalendarList, fetchEventsForWeek,
  parseEventTiming, getGoogleAuthUrl,
} from "../lib/googleCalendar";
import { getWeekStart, getWeekEnd } from "../lib/weekUtils";

export function useCalendar() {
  const { user }   = useAuth();
  const [settings, setSettings]     = useState({});
  const [calendars, setCalendars]   = useState([]);
  const [connected, setConnected]   = useState(false);

  // Загрузка настроек
  useEffect(() => {
    if (!user) return;
    loadSettings(user.id).then(s => {
      setSettings(s);
      setConnected(isTokenValid(s));
    });
  }, [user]);

  // Поймать токен из URL после OAuth redirect
  useEffect(() => {
    const token = parseTokenFromHash();
    if (!token || !user) return;
    window.history.replaceState({}, "", window.location.pathname);
    const updates = {
      google_access_token: token.access_token,
      google_token_expiry: token.expiry_time,
    };
    saveSettings(user.id, updates).then(() => {
      setSettings(prev => ({ ...prev, ...updates }));
      setConnected(true);
    });
  }, [user]);

  // Загрузить список календарей
  useEffect(() => {
    if (!connected || !settings.google_access_token) return;
    fetchCalendarList(settings.google_access_token)
      .then(setCalendars)
      .catch(console.error);
  }, [connected, settings.google_access_token]);

  // Сохранить выбранные календари
  const toggleCalendar = useCallback(async (calId) => {
    const current  = settings.selected_calendars ?? [];
    const updated  = current.includes(calId)
      ? current.filter(id => id !== calId)
      : [...current, calId];
    await saveSettings(user.id, { selected_calendars: updated });
    setSettings(prev => ({ ...prev, selected_calendars: updated }));
  }, [settings, user]);

  // Получить события за неделю
  const getWeekEvents = useCallback(async (weekId) => {
    if (!connected || !settings.google_access_token) return [];
    const selected = settings.selected_calendars ?? [];
    if (!selected.length) return [];

    const start = getWeekStart(weekId);
    const end   = getWeekEnd(weekId);
    end.setDate(end.getDate() + 1);

    const allEvents = await Promise.all(
      selected.map(calId =>
        fetchEventsForWeek(settings.google_access_token, calId, start, end)
          .catch(() => [])
      )
    );
    
    return allEvents.flat().map((e) => {
        const { time, durationHours } = parseEventTiming(e.start, e.end);
        return{
            id:       e.id,
            title:    e.summary ?? "(без названия)",
            time,
            durationHours,
            date:     e.start?.date ?? e.start?.dateTime?.split("T")[0],
            allDay:   !!e.start?.date,
        }   
    });
  }, [connected, settings]);

  return {
    connected,
    calendars,
    selectedCalendars: settings.selected_calendars ?? [],
    toggleCalendar,
    getWeekEvents,
    connectUrl: getGoogleAuthUrl(),
  };
}