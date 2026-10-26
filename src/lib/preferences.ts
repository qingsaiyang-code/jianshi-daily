export const PREFERENCES_KEY = "jianshi-daily:preferences:v1";

export interface Preferences {
  version: 1;
  saved: string[];
  hidden: string[];
}

export const emptyPreferences: Preferences = { version: 1, saved: [], hidden: [] };

export function parsePreferences(raw: string | null): Preferences {
  if (!raw) return { ...emptyPreferences, saved: [], hidden: [] };
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object" || !("version" in value) || value.version !== 1) return { ...emptyPreferences, saved: [], hidden: [] };
    const safeIds = (key: string) => {
      const list = (value as Record<string, unknown>)[key];
      return Array.isArray(list) ? [...new Set(list.filter((id): id is string => typeof id === "string"))] : [];
    };
    return { version: 1, saved: safeIds("saved"), hidden: safeIds("hidden") };
  } catch {
    return { ...emptyPreferences, saved: [], hidden: [] };
  }
}

export function toggleSaved(preferences: Preferences, id: string): Preferences {
  return { ...preferences, saved: preferences.saved.includes(id) ? preferences.saved.filter((item) => item !== id) : [...preferences.saved, id] };
}

export function hideCard(preferences: Preferences, id: string): Preferences {
  return { ...preferences, hidden: [...new Set([...preferences.hidden, id])] };
}
