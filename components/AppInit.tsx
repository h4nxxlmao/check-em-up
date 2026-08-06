"use client";

import { useEffect } from "react";
import { useAppStore } from "@/stores/useAppStore";
import { useTheme } from "next-themes";

export function AppInit() {
  const loadChecklists = useAppStore(state => state.loadChecklists);
  const loadSettings = useAppStore(state => state.loadSettings);
  const settings = useAppStore(state => state.settings);
  const isSettingsLoaded = useAppStore(state => state.isSettingsLoaded);
  const { setTheme } = useTheme();

  useEffect(() => {
    loadSettings();
    loadChecklists();
  }, [loadSettings, loadChecklists]);

  useEffect(() => {
    if (isSettingsLoaded) {
      setTheme(settings.theme);
    }
  }, [settings.theme, isSettingsLoaded, setTheme]);

  return null;
}
