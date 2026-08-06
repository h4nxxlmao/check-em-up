import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Checklist, ChecklistItem, AppSettings, AppDataExport } from '@/types';

const DB_NAME = 'check-em-up-db';
const DB_VERSION = 1;

interface CheckEmUpDB extends DBSchema {
  checklists: {
    key: string;
    value: Checklist;
    indexes: { 'by-order': number };
  };
  items: {
    key: string;
    value: ChecklistItem;
    indexes: { 'by-checklist': string };
  };
  settings: {
    key: string;
    value: AppSettings;
  };
}

let dbPromise: Promise<IDBPDatabase<CheckEmUpDB>> | null = null;

const isBrowser = typeof window !== 'undefined';

function getDB() {
  if (!isBrowser) return null;
  if (!dbPromise) {
    dbPromise = openDB<CheckEmUpDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('checklists')) {
          const checklistStore = db.createObjectStore('checklists', { keyPath: 'id' });
          checklistStore.createIndex('by-order', 'order');
        }
        if (!db.objectStoreNames.contains('items')) {
          const itemStore = db.createObjectStore('items', { keyPath: 'id' });
          itemStore.createIndex('by-checklist', 'checklistId');
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'id' }); // Dummy keyPath, we only store one record usually
        }
      },
    }).catch(error => {
      console.error('Failed to open IndexedDB', error);
      return null;
    }) as Promise<IDBPDatabase<CheckEmUpDB>>;
  }
  return dbPromise;
}

// Fallback to LocalStorage if IDB fails or is not supported
function useLocalStorageFallback() {
  return !isBrowser || !window.indexedDB;
}

// Checklists
export async function getChecklists(): Promise<Checklist[]> {
  if (useLocalStorageFallback()) {
    const data = localStorage.getItem('checklists');
    return data ? JSON.parse(data) : [];
  }
  const db = await getDB();
  if (!db) return [];
  const checklists = await db.getAllFromIndex('checklists', 'by-order');
  return checklists.sort((a, b) => a.order - b.order);
}

export async function saveChecklist(checklist: Checklist): Promise<void> {
  if (useLocalStorageFallback()) {
    const checklists = await getChecklists();
    const index = checklists.findIndex(c => c.id === checklist.id);
    if (index > -1) {
      checklists[index] = checklist;
    } else {
      checklists.push(checklist);
    }
    localStorage.setItem('checklists', JSON.stringify(checklists));
    return;
  }
  const db = await getDB();
  if (db) {
    await db.put('checklists', checklist);
  }
}

export async function deleteChecklist(id: string): Promise<void> {
  if (useLocalStorageFallback()) {
    const checklists = await getChecklists();
    localStorage.setItem('checklists', JSON.stringify(checklists.filter(c => c.id !== id)));
    // Also delete associated items
    const items = await getAllItems();
    localStorage.setItem('items', JSON.stringify(items.filter(i => i.checklistId !== id)));
    return;
  }
  const db = await getDB();
  if (db) {
    const tx = db.transaction(['checklists', 'items'], 'readwrite');
    await tx.objectStore('checklists').delete(id);
    
    // Delete associated items
    const itemStore = tx.objectStore('items');
    const index = itemStore.index('by-checklist');
    const items = await index.getAllKeys(id);
    await Promise.all(items.map(key => itemStore.delete(key)));
    await tx.done;
  }
}

export async function saveChecklistsBulk(checklists: Checklist[]): Promise<void> {
  if (useLocalStorageFallback()) {
    localStorage.setItem('checklists', JSON.stringify(checklists));
    return;
  }
  const db = await getDB();
  if (db) {
    const tx = db.transaction('checklists', 'readwrite');
    await Promise.all(checklists.map(c => tx.store.put(c)));
    await tx.done;
  }
}

// Items
export async function getItemsByChecklist(checklistId: string): Promise<ChecklistItem[]> {
  if (useLocalStorageFallback()) {
    const items = await getAllItems();
    return items.filter(i => i.checklistId === checklistId).sort((a, b) => a.order - b.order);
  }
  const db = await getDB();
  if (!db) return [];
  const items = await db.getAllFromIndex('items', 'by-checklist', checklistId);
  return items.sort((a, b) => a.order - b.order);
}

export async function getAllItems(): Promise<ChecklistItem[]> {
  if (useLocalStorageFallback()) {
    const data = localStorage.getItem('items');
    return data ? JSON.parse(data) : [];
  }
  const db = await getDB();
  if (!db) return [];
  return db.getAll('items');
}

export async function saveItem(item: ChecklistItem): Promise<void> {
  if (useLocalStorageFallback()) {
    const items = await getAllItems();
    const index = items.findIndex(i => i.id === item.id);
    if (index > -1) {
      items[index] = item;
    } else {
      items.push(item);
    }
    localStorage.setItem('items', JSON.stringify(items));
    return;
  }
  const db = await getDB();
  if (db) {
    await db.put('items', item);
  }
}

export async function deleteItem(id: string): Promise<void> {
  if (useLocalStorageFallback()) {
    const items = await getAllItems();
    localStorage.setItem('items', JSON.stringify(items.filter(i => i.id !== id)));
    return;
  }
  const db = await getDB();
  if (db) {
    await db.delete('items', id);
  }
}

export async function deleteCompletedItems(checklistId: string): Promise<void> {
  const items = await getItemsByChecklist(checklistId);
  const completed = items.filter(i => i.completed);
  for (const item of completed) {
    await deleteItem(item.id);
  }
}

export async function saveItemsBulk(items: ChecklistItem[]): Promise<void> {
  if (useLocalStorageFallback()) {
    // Merge updates
    const allItems = await getAllItems();
    const itemMap = new Map(allItems.map(i => [i.id, i]));
    items.forEach(i => itemMap.set(i.id, i));
    localStorage.setItem('items', JSON.stringify(Array.from(itemMap.values())));
    return;
  }
  const db = await getDB();
  if (db) {
    const tx = db.transaction('items', 'readwrite');
    await Promise.all(items.map(i => tx.store.put(i)));
    await tx.done;
  }
}

// Settings
const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  soundEnabled: true,
  soundVariation: 'default',
  moveCompletedToBottom: false,
  hideCompleted: false,
};

export async function getSettings(): Promise<AppSettings> {
  if (useLocalStorageFallback()) {
    const data = localStorage.getItem('settings');
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
  }
  const db = await getDB();
  if (!db) return DEFAULT_SETTINGS;
  const settings = await db.get('settings', 'app-settings' as any);
  return settings ? { ...DEFAULT_SETTINGS, ...settings } : DEFAULT_SETTINGS;
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  if (useLocalStorageFallback()) {
    localStorage.setItem('settings', JSON.stringify(settings));
    return;
  }
  const db = await getDB();
  if (db) {
    await db.put('settings', { ...settings, id: 'app-settings' } as any);
  }
}

// Export / Import
export async function exportData(): Promise<string> {
  const checklists = await getChecklists();
  const items = await getAllItems();
  const settings = await getSettings();

  const data: AppDataExport = {
    version: 1,
    exportDate: Date.now(),
    checklists,
    items,
    settings,
  };
  return JSON.stringify(data, null, 2);
}

export async function importData(jsonString: string): Promise<boolean> {
  try {
    const data = JSON.parse(jsonString) as AppDataExport;
    
    // Basic validation
    if (!data.checklists || !Array.isArray(data.checklists) || !data.items || !Array.isArray(data.items)) {
      return false;
    }

    if (useLocalStorageFallback()) {
      localStorage.setItem('checklists', JSON.stringify(data.checklists));
      localStorage.setItem('items', JSON.stringify(data.items));
      if (data.settings) {
        localStorage.setItem('settings', JSON.stringify(data.settings));
      }
      return true;
    }

    const db = await getDB();
    if (!db) return false;

    const tx = db.transaction(['checklists', 'items', 'settings'], 'readwrite');
    
    // Clear existing
    await tx.objectStore('checklists').clear();
    await tx.objectStore('items').clear();
    
    // Insert new
    await Promise.all(data.checklists.map(c => tx.objectStore('checklists').put(c)));
    await Promise.all(data.items.map(i => tx.objectStore('items').put(i)));
    if (data.settings) {
      await tx.objectStore('settings').put({ ...data.settings, id: 'app-settings' } as any);
    }
    
    await tx.done;
    return true;
  } catch (error) {
    console.error('Import failed', error);
    return false;
  }
}
