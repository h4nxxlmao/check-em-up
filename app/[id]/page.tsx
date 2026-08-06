"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { useChecklists } from "@/hooks/useChecklists"
import { useChecklistItems } from "@/hooks/useChecklistItems"
import { useSound } from "@/hooks/useSound"
import { AppShell } from "@/components/layout/AppShell"
import { ChecklistItem } from "@/components/checklist/ChecklistItem"
import { ArrowLeft, Trash2, PencilLine } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { v4 as uuidv4 } from "uuid"

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { ChecklistItem as ItemType } from "@/types"

function SortableItem({
  item,
  isEditing,
  onUpdate,
  onDelete,
}: {
  item: ItemType
  isEditing: boolean
  onUpdate: (id: string, updates: Partial<ItemType>) => void
  onDelete: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <ChecklistItem
      item={item}
      isEditing={isEditing}
      onUpdate={onUpdate}
      onDelete={onDelete}
      setNodeRef={setNodeRef}
      style={style}
      isDragging={isDragging}
      dragAttributes={attributes}
      dragListeners={listeners}
    />
  )
}

export default function ChecklistPage() {
  const { id } = useParams()
  const router = useRouter()
  const { checklists, updateChecklist, deleteChecklist, isLoaded } = useChecklists()
  const { items, isLoading, addItem, updateItem, deleteItem, reorderItems } = useChecklistItems(id as string)
  const { playCheckSound } = useSound()

  const [isEditing, setIsEditing] = React.useState(false)
  const [newItemText, setNewItemText] = React.useState("")
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const hasSetInitialMode = React.useRef(false)

  React.useEffect(() => {
    if (!isLoading && !hasSetInitialMode.current) {
      hasSetInitialMode.current = true
      if (items.length === 0) setIsEditing(true)
    }
  }, [isLoading, items.length])

  React.useEffect(() => {
    if (isEditing && textareaRef.current) {
      if (items.length === 0) textareaRef.current.focus()
    }
  }, [isEditing, items.length])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  if (!isLoaded || isLoading) return null

  const checklist = checklists.find((c) => c.id === id)

  if (!checklist) {
    return (
      <AppShell>
        <div className="text-center py-24">
          <p className="text-neutral-400 mb-6 text-sm">Checklist not found.</p>
          <button
            onClick={() => router.push("/")}
            className="text-sm underline underline-offset-4 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
          >
            Go back
          </button>
        </div>
      </AppShell>
    )
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      reorderItems(active.id as string, over.id as string)
    }
  }

  const commitLines = (raw: string) => {
    const lines = raw.split(/[\r\n]+/).map((l) => l.trim()).filter(Boolean)
    if (lines.length === 0) return
    const base = items.length
    lines.forEach((text, i) => {
      addItem({
        id: uuidv4(),
        checklistId: checklist.id,
        text,
        completed: false,
        createdAt: Date.now(),
        order: base + i,
      })
    })
    setNewItemText("")
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    if (val.includes("\n")) {
      commitLines(val)
    } else {
      setNewItemText(val)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      commitLines(newItemText)
    }
  }

  const handleUpdateItem = (itemId: string, updates: Partial<ItemType>) => {
    if (updates.completed !== undefined && updates.completed === true) {
      playCheckSound()
    }
    updateItem(itemId, updates)
  }

  const completedCount = items.filter((i) => i.completed).length
  const totalCount = items.length

  return (
    <AppShell>
      <header className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            All lists
          </button>

          <div className="flex items-center gap-1">
            {isEditing && (
              <button
                onClick={() => {
                  if (confirm("Delete this checklist?")) {
                    deleteChecklist(checklist.id)
                    router.push("/")
                  }
                }}
                className="p-2 rounded-lg text-neutral-300 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                aria-label="Delete checklist"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={() => setIsEditing((v) => !v)}
              className="flex items-center gap-1.5 px-3 h-8 rounded-lg text-sm transition-colors bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800"
            >
              {isEditing ? (
                "Done"
              ) : (
                <>
                  <PencilLine className="h-3.5 w-3.5" />
                  Edit
                </>
              )}
            </button>
          </div>
        </div>

        {isEditing ? (
          <input
            value={checklist.title}
            onChange={(e) => updateChecklist(checklist.id, { title: e.target.value })}
            className="w-full text-2xl font-semibold tracking-tight bg-transparent border-none outline-none placeholder:text-neutral-300 dark:placeholder:text-neutral-700 text-neutral-900 dark:text-neutral-50"
            placeholder="Untitled"
          />
        ) : (
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50 select-none">
            {checklist.title || <span className="text-neutral-300 dark:text-neutral-700 font-normal">Untitled</span>}
          </h1>
        )}

        {totalCount > 0 && (
          <p className="text-sm text-neutral-400 mt-0.5 select-none">
            {completedCount} of {totalCount} done
          </p>
        )}
      </header>

      <div className="space-y-0.5">
        {isEditing ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
              <AnimatePresence mode="popLayout">
                {items.map((item) => (
                  <SortableItem
                    key={item.id}
                    item={item}
                    isEditing
                    onUpdate={handleUpdateItem}
                    onDelete={deleteItem}
                  />
                ))}
              </AnimatePresence>
            </SortableContext>
          </DndContext>
        ) : (
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <ChecklistItem
                key={item.id}
                item={item}
                isEditing={false}
                onUpdate={handleUpdateItem}
                onDelete={deleteItem}
              />
            ))}
          </AnimatePresence>
        )}

        {isEditing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-start gap-3 px-1 py-2"
          >
            <div className="h-[18px] w-[18px] mt-0.5 shrink-0 rounded-[5px] border border-dashed border-neutral-300 dark:border-neutral-700" />
            <textarea
              ref={textareaRef}
              value={newItemText}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              placeholder="Add a task…"
              rows={1}
              className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-neutral-400 dark:placeholder:text-neutral-600 text-neutral-900 dark:text-neutral-100 leading-5"
            />
          </motion.div>
        )}

        {!isEditing && items.length === 0 && (
          <p className="text-sm text-neutral-400 dark:text-neutral-600 px-1 py-2 select-none">
            Nothing here yet.{" "}
            <button
              onClick={() => setIsEditing(true)}
              className="underline underline-offset-2 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
            >
              Add items
            </button>
          </p>
        )}
      </div>
    </AppShell>
  )
}
