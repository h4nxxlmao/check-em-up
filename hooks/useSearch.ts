import { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import * as storage from '@/lib/storage';
import { Checklist, ChecklistItem } from '@/types';

export type SearchResult = {
  checklist: Checklist;
  matchingItems: ChecklistItem[];
};

export function useSearch() {
  const query = useAppStore(state => state.searchQuery);
  const setQuery = useAppStore(state => state.setSearchQuery);
  const checklists = useAppStore(state => state.checklists);
  
  const [allItems, setAllItems] = useState<ChecklistItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (query.trim() !== '') {
      setIsSearching(true);
      storage.getAllItems().then(items => {
        setAllItems(items);
        setIsSearching(false);
      });
    } else {
      setAllItems([]);
    }
  }, [query]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    
    const lowerQuery = query.toLowerCase();
    
    return checklists.reduce((acc, checklist) => {
      const checklistMatches = 
        checklist.title.toLowerCase().includes(lowerQuery) || 
        (checklist.description?.toLowerCase().includes(lowerQuery) || false);
      
      const matchingItems = allItems.filter(
        item => item.checklistId === checklist.id && 
                (item.text.toLowerCase().includes(lowerQuery) || (item.note?.toLowerCase().includes(lowerQuery) || false))
      );
      
      if (checklistMatches || matchingItems.length > 0) {
        acc.push({ checklist, matchingItems });
      }
      
      return acc;
    }, [] as SearchResult[]);
  }, [query, checklists, allItems]);

  return {
    query,
    setQuery,
    results,
    isSearching,
  };
}
