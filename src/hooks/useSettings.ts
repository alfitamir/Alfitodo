import { useEffect, useState } from 'react';
import { loadSettings, saveSettings } from '../lib/storage';
import type { AppSettings } from '../types';

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
    saveSettings(settings);
  }, [settings]);

  return { settings, setSettings };
}
