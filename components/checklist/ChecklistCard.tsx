import * as React from "react"
import { motion } from "framer-motion"
import { Checklist } from "@/types"
import { useChecklistItems } from "@/hooks/useChecklistItems"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { GripVertical } from "lucide-react"

export function ChecklistCard({
  checklist,
  isDragging,
  dragListeners,
  dragAttributes,
  setNodeRef,
  style
}: {
  checklist: Checklist;
  isDragging?: boolean;
  dragListeners?: React.HTMLAttributes<HTMLElement>;
  dragAttributes?: React.HTMLAttributes<HTMLElement>;
  setNodeRef?: (node: HTMLElement | null) => void;
  style?: React.CSSProperties;
}) {
  const { items, isLoading } = useChecklistItems(checklist.id);

  const totalItems = items.length;
  const completedItems = items.filter(i => i.completed).length;
  const allDone = totalItems > 0 && completedItems === totalItems;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-900",
        isDragging && "opacity-40"
      )}
    >
      <Link href={`/${checklist.id}`} className="absolute inset-0 z-10 rounded-xl" />

      {dragListeners && (
        <div
          {...dragListeners}
          {...dragAttributes}
          className="z-20 shrink-0 cursor-grab active:cursor-grabbing text-neutral-300 dark:text-neutral-700 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical className="h-4 w-4" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm font-medium leading-tight truncate",
          allDone && "text-neutral-400 dark:text-neutral-600 line-through"
        )}>
          {checklist.title || <span className="text-neutral-400 dark:text-neutral-600 font-normal">Untitled</span>}
        </p>
        {checklist.description && (
          <p className="text-xs text-neutral-400 dark:text-neutral-600 mt-0.5 truncate">{checklist.description}</p>
        )}
      </div>

      {!isLoading && totalItems > 0 && (
        <span className="shrink-0 text-xs tabular-nums text-neutral-400 dark:text-neutral-600 z-20">
          {completedItems}/{totalItems}
        </span>
      )}
    </motion.div>
  );
}
