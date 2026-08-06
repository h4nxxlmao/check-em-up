import * as React from "react"
import { motion } from "framer-motion"
import { ChecklistItem as ItemType } from "@/types"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { GripVertical, X, Check } from "lucide-react"

interface ChecklistItemProps {
  item: ItemType;
  isEditing: boolean;
  onUpdate: (id: string, updates: Partial<ItemType>) => void;
  onDelete: (id: string) => void;
  dragListeners?: React.HTMLAttributes<HTMLElement>;
  dragAttributes?: React.HTMLAttributes<HTMLElement>;
  setNodeRef?: (node: HTMLElement | null) => void;
  style?: React.CSSProperties;
  isDragging?: boolean;
}

export function ChecklistItem({
  item,
  isEditing,
  onUpdate,
  onDelete,
  dragListeners,
  dragAttributes,
  setNodeRef,
  style,
  isDragging,
}: ChecklistItemProps) {
  const [isTextEditing, setIsTextEditing] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isTextEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isTextEditing]);

  if (!isEditing) {
    return (
      <motion.div
        ref={setNodeRef}
        style={style}
        layout
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0, transition: { duration: 0.15 } }}
        className={cn(isDragging && "opacity-40")}
      >
        <button
          type="button"
          onClick={() => onUpdate(item.id, { completed: !item.completed })}
          className="flex items-center gap-3 w-full rounded-xl px-1 py-2.5 text-left transition-colors hover:bg-neutral-100/70 dark:hover:bg-neutral-900/50 select-none"
        >
          <div className={cn(
            "h-[18px] w-[18px] shrink-0 rounded-[5px] border flex items-center justify-center transition-all",
            item.completed
              ? "bg-neutral-900 border-neutral-900 dark:bg-neutral-100 dark:border-neutral-100"
              : "border-neutral-300 dark:border-neutral-700"
          )}>
            {item.completed && (
              <Check className="h-3 w-3 text-white dark:text-neutral-900" strokeWidth={3} />
            )}
          </div>
          <span className={cn(
            "flex-1 text-sm leading-snug",
            item.completed
              ? "line-through text-neutral-400 dark:text-neutral-600"
              : "text-neutral-900 dark:text-neutral-100"
          )}>
            {item.text}
          </span>
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0, transition: { duration: 0.15 } }}
      className={cn(
        "group flex items-center gap-3 rounded-xl px-1 py-2 transition-colors hover:bg-neutral-100/70 dark:hover:bg-neutral-900/50",
        isDragging && "opacity-40 bg-neutral-100 dark:bg-neutral-900"
      )}
    >
      <div
        {...dragListeners}
        {...dragAttributes}
        className="shrink-0 cursor-grab active:cursor-grabbing text-neutral-300 dark:text-neutral-700 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="h-4 w-4" />
      </div>

      <div className="shrink-0">
        <Checkbox
          checked={item.completed}
          onCheckedChange={(checked) => onUpdate(item.id, { completed: checked })}
        />
      </div>

      <div className="flex-1 min-w-0">
        {isTextEditing ? (
          <input
            ref={inputRef}
            defaultValue={item.text}
            onBlur={(e) => {
              setIsTextEditing(false);
              const val = e.target.value.trim();
              if (val && val !== item.text) {
                onUpdate(item.id, { text: val });
              } else if (!val) {
                onDelete(item.id);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
              if (e.key === "Escape") {
                e.currentTarget.value = item.text;
                setIsTextEditing(false);
              }
            }}
            className="w-full bg-transparent text-sm outline-none text-neutral-900 dark:text-neutral-100"
          />
        ) : (
          <button
            type="button"
            onClick={() => setIsTextEditing(true)}
            className={cn(
              "text-left w-full text-sm leading-snug break-words transition-colors",
              item.completed
                ? "line-through text-neutral-400 dark:text-neutral-600"
                : "text-neutral-900 dark:text-neutral-100"
            )}
          >
            {item.text}
          </button>
        )}
      </div>

      <button
        onClick={() => onDelete(item.id)}
        className="shrink-0 opacity-0 group-hover:opacity-100 p-1 rounded-md text-neutral-300 hover:text-neutral-600 dark:text-neutral-700 dark:hover:text-neutral-400 transition-all"
        aria-label="Delete item"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}
