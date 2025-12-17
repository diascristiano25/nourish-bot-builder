import { useState, useEffect } from 'react';

export interface WidgetPreferences {
  agenda: boolean;
  recentPatients: boolean;
  quickActions: boolean;
  stats: boolean;
}

const DEFAULT_PREFERENCES: WidgetPreferences = {
  agenda: true,
  recentPatients: true,
  quickActions: true,
  stats: true,
};

const STORAGE_KEY = 'nutriflow_widget_preferences';

export function useWidgetPreferences() {
  const [preferences, setPreferences] = useState<WidgetPreferences>(DEFAULT_PREFERENCES);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setPreferences({ ...DEFAULT_PREFERENCES, ...JSON.parse(stored) });
      } catch {
        setPreferences(DEFAULT_PREFERENCES);
      }
    }
    setLoaded(true);
  }, []);

  const updatePreference = (key: keyof WidgetPreferences, value: boolean) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPreferences));
  };

  const resetPreferences = () => {
    setPreferences(DEFAULT_PREFERENCES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PREFERENCES));
  };

  return {
    preferences,
    updatePreference,
    resetPreferences,
    loaded,
  };
}
