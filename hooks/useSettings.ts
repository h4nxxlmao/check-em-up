import { useAppStore } from '@/stores/useAppStore';

export function useSettings() {
  const settings = useAppStore(state => state.settings);
  const isLoaded = useAppStore(state => state.isSettingsLoaded);
  
  const loadSettings = useAppStore(state => state.loadSettings);
  const updateSettings = useAppStore(state => state.updateSettings);

  return {
    settings,
    isLoaded,
    loadSettings,
    updateSettings,
  };
}
