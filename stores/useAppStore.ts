import { create } from 'zustand';
import { Checklist, ChecklistItem, AppSettings } from '@/types';
import * as storage from '@/lib/storage';

interface AppState {
  checklists: Checklist[];
  isChecklistsLoaded: boolean;
  
  settings: AppSettings;
  isSettingsLoaded: boolean;

  searchQuery: string;

  // Actions
  loadChecklists: () => Promise<void>;
  addChecklist: (checklist: Checklist) => Promise<void>;
  updateChecklist: (id: string, updates: Partial<Checklist>) => Promise<void>;
  deleteChecklist: (id: string) => Promise<void>;
  reorderChecklists: (activeId: string, overId: string) => Promise<void>;

  loadSettings: () => Promise<void>;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;

  setSearchQuery: (query: string) => void;
  
  // Expose import/export helpers for UI
  importData: (json: string) => Promise<boolean>;
  exportData: () => Promise<string>;
}

export const useAppStore = create<AppState>((set, get) => ({
  checklists: [],
  isChecklistsLoaded: false,

  settings: {
    theme: 'system',
    soundEnabled: true,
    soundVariation: 'default',
    moveCompletedToBottom: false,
    hideCompleted: false,
  },
  isSettingsLoaded: false,

  searchQuery: '',

  loadChecklists: async () => {
    const checklists = await storage.getChecklists();
    set({ checklists, isChecklistsLoaded: true });
  },

  addChecklist: async (checklist) => {
    await storage.saveChecklist(checklist);
    set((state) => ({
      checklists: [...state.checklists, checklist].sort((a, b) => a.order - b.order),
    }));
  },

  updateChecklist: async (id, updates) => {
    const { checklists } = get();
    const existing = checklists.find(c => c.id === id);
    if (!existing) return;
    
    const updated = { ...existing, ...updates, updatedAt: Date.now() };
    await storage.saveChecklist(updated);
    
    set((state) => ({
      checklists: state.checklists.map(c => c.id === id ? updated : c).sort((a, b) => a.order - b.order),
    }));
  },

  deleteChecklist: async (id) => {
    await storage.deleteChecklist(id);
    set((state) => ({
      checklists: state.checklists.filter(c => c.id !== id),
    }));
  },

  reorderChecklists: async (activeId, overId) => {
    const { checklists } = get();
    const oldIndex = checklists.findIndex(c => c.id === activeId);
    const newIndex = checklists.findIndex(c => c.id === overId);
    
    if (oldIndex === -1 || newIndex === -1) return;
    
    const newChecklists = Array.from(checklists);
    const [movedItem] = newChecklists.splice(oldIndex, 1);
    newChecklists.splice(newIndex, 0, movedItem);
    
    // Update order values based on array position
    const updatedChecklists = newChecklists.map((c, index) => ({ ...c, order: index }));
    
    // Optimistic UI update
    set({ checklists: updatedChecklists });
    
    // Save to DB
    await storage.saveChecklistsBulk(updatedChecklists);
  },

  loadSettings: async () => {
    const settings = await storage.getSettings();
    set({ settings, isSettingsLoaded: true });
  },

  updateSettings: async (updates) => {
    const { settings } = get();
    const newSettings = { ...settings, ...updates };
    set({ settings: newSettings });
    await storage.saveSettings(newSettings);
  },

  setSearchQuery: (query) => set({ searchQuery: query }),

  importData: async (json) => {
    const success = await storage.importData(json);
    if (success) {
      await get().loadChecklists();
      await get().loadSettings();
    }
    return success;
  },

  exportData: async () => {
    return await storage.exportData();
  }
}));
