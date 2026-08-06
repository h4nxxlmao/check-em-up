import { useAppStore } from '@/stores/useAppStore';

export function useChecklists() {
  const checklists = useAppStore(state => state.checklists);
  const isLoaded = useAppStore(state => state.isChecklistsLoaded);
  
  const addChecklist = useAppStore(state => state.addChecklist);
  const updateChecklist = useAppStore(state => state.updateChecklist);
  const deleteChecklist = useAppStore(state => state.deleteChecklist);
  const reorderChecklists = useAppStore(state => state.reorderChecklists);
  const loadChecklists = useAppStore(state => state.loadChecklists);

  const activeChecklists = checklists.filter(c => !c.archived);
  const archivedChecklists = checklists.filter(c => c.archived);
  
  return {
    checklists,
    activeChecklists,
    archivedChecklists,
    isLoaded,
    addChecklist,
    updateChecklist,
    deleteChecklist,
    reorderChecklists,
    loadChecklists
  };
}
