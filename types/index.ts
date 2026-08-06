export type Checklist = {
  id: string;
  title: string;
  description?: string;
  color?: string;
  favorite?: boolean;
  archived?: boolean;
  pinned?: boolean;
  createdAt: number;
  updatedAt: number;
  order: number;
};

export type ChecklistItem = {
  id: string;
  checklistId: string;
  text: string;
  note?: string;
  completed: boolean;
  createdAt: number;
  order: number;
};

export type AppSettings = {
  theme: 'system' | 'light' | 'dark';
  soundEnabled: boolean;
  soundVariation: string;
  moveCompletedToBottom: boolean;
  hideCompleted: boolean;
};

export type AppDataExport = {
  version: number;
  exportDate: number;
  checklists: Checklist[];
  items: ChecklistItem[];
  settings: AppSettings;
};
