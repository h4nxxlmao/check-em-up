"use client"

import * as React from "react"
import { useChecklists } from "@/hooks/useChecklists"
import { useSearch } from "@/hooks/useSearch"
import { ChecklistCard } from "@/components/checklist/ChecklistCard"
import { AppShell } from "@/components/layout/AppShell"
import { Search } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { v4 as uuidv4 } from "uuid"
import { useRouter } from "next/navigation"

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Checklist } from "@/types"

function SortableChecklistCard({ checklist }: { checklist: Checklist }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: checklist.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <ChecklistCard
      checklist={checklist}
      setNodeRef={setNodeRef}
      style={style}
      isDragging={isDragging}
      dragAttributes={attributes}
      dragListeners={listeners}
    />
  );
}

export default function Home() {
  const { activeChecklists, isLoaded, addChecklist, reorderChecklists } = useChecklists();
  const { query, setQuery, results } = useSearch();
  const router = useRouter();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderChecklists(active.id as string, over.id as string);
    }
  };

  const createChecklist = () => {
    const newId = uuidv4();
    addChecklist({
      id: newId,
      title: "",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      order: activeChecklists.length,
    });
    router.push(`/${newId}`);
  };

  return (
    <AppShell>
      <header className="mb-10 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Lists</h1>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="h-9 pl-9 pr-4 w-52 rounded-xl text-sm bg-neutral-100 dark:bg-neutral-900 border border-transparent focus:border-neutral-300 dark:focus:border-neutral-700 outline-none transition-colors placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
          />
        </div>
      </header>

      {query.trim() !== '' ? (
        <div className="space-y-4">
          {results.length === 0 ? (
            <p className="text-sm text-neutral-400 py-8 text-center">No results for &ldquo;{query}&rdquo;</p>
          ) : (
            <div className="space-y-2">
              {results.map(({ checklist, matchingItems }) => (
                <div key={checklist.id}>
                  <ChecklistCard checklist={checklist} />
                  {matchingItems.length > 0 && (
                    <div className="ml-9 mt-1 space-y-0.5">
                      {matchingItems.map(item => (
                        <p key={item.id} className={`text-sm text-neutral-500 dark:text-neutral-500 truncate ${item.completed ? 'line-through' : ''}`}>
                          {item.text}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {!isLoaded ? null : activeChecklists.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-20 text-center"
            >
              <p className="text-neutral-400 dark:text-neutral-600 text-sm mb-6">
                Nothing here yet.
              </p>
              <button
                onClick={createChecklist}
                className="text-sm text-neutral-900 dark:text-neutral-100 underline underline-offset-4 decoration-neutral-300 dark:decoration-neutral-700 hover:decoration-neutral-900 dark:hover:decoration-neutral-100 transition-all"
              >
                Create your first list
              </button>
            </motion.div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={activeChecklists.map(c => c.id)}
                strategy={verticalListSortingStrategy}
              >
                <motion.div layout className="space-y-1.5">
                  <AnimatePresence mode="popLayout">
                    {activeChecklists.map((checklist) => (
                      <SortableChecklistCard key={checklist.id} checklist={checklist} />
                    ))}
                  </AnimatePresence>
                </motion.div>
              </SortableContext>
            </DndContext>
          )}
        </>
      )}
    </AppShell>
  )
}
