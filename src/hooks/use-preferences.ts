"use client";

import { useMemo, useSyncExternalStore } from "react";
import { parsePreferences, PREFERENCES_KEY, type Preferences } from "@/lib/preferences";

const CHANGE_EVENT = "jianshi-preferences-change";

function getSnapshot(): string | null {
  try { return window.localStorage.getItem(PREFERENCES_KEY); } catch { return null; }
}

function subscribe(listener: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === PREFERENCES_KEY || event.key === null) listener();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(CHANGE_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CHANGE_EVENT, listener);
  };
}

const getServerSnapshot = () => null;

export function usePreferences() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const preferences = useMemo(() => parsePreferences(raw), [raw]);

  function update(recipe: (current: Preferences) => Preferences): boolean {
    try {
      window.localStorage.setItem(PREFERENCES_KEY, JSON.stringify(recipe(parsePreferences(getSnapshot()))));
      window.dispatchEvent(new Event(CHANGE_EVENT));
      return true;
    } catch { return false; }
  }

  return { preferences, update };
}
