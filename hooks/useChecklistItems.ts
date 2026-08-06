import { useState, useEffect, useCallback } from 'react';
import { ChecklistItem } from '@/types';
import * as storage from '@/lib/storage';

export function useChecklistItems(checklistId: string) {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadItems = useCallback(async () => {
    setIsLoading(true);
    const loadedItems = await storage.getItemsByChecklist(checklistId);
    setItems(loadedItems);
    setIsLoading(false);
  }, [checklistId]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const addItem = async (item: ChecklistItem) => {
    await storage.saveItem(item);
    setItems(prev => [...prev, item].sort((a, b) => a.order - b.order));
  };

  const updateItem = async (id: string, updates: Partial<ChecklistItem>) => {
    const existing = items.find(i => i.id === id);
    if (!existing) return;
    
    const updated = { ...existing, ...updates };
    await storage.saveItem(updated);
    setItems(prev => prev.map(i => i.id === id ? updated : i).sort((a, b) => a.order - b.order));
  };

  const deleteItem = async (id: string) => {
    await storage.deleteItem(id);
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const reorderItems = async (activeId: string, overId: string) => {
    const oldIndex = items.findIndex(i => i.id === activeId);
    const newIndex = items.findIndex(i => i.id === overId);
    
    if (oldIndex === -1 || newIndex === -1) return;
    
    const newItems = Array.from(items);
    const [movedItem] = newItems.splice(oldIndex, 1);
    newItems.splice(newIndex, 0, movedItem);
    
    const updatedItems = newItems.map((item, index) => ({ ...item, order: index }));
    
    // Optimistic update
    setItems(updatedItems);
    
    // Save bulk
    await storage.saveItemsBulk(updatedItems);
  };

  const deleteCompleted = async () => {
    await storage.deleteCompletedItems(checklistId);
    setItems(prev => prev.filter(i => !i.completed));
  };

  return {
    items,
    isLoading,
    addItem,
    updateItem,
    deleteItem,
    reorderItems,
    deleteCompleted,
    reload: loadItems,
  };
}
