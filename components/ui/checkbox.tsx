import * as React from "react"
import * as ReactDOM from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export interface CheckboxProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
  disabled?: boolean;
}

export function Checkbox({ className, checked, onCheckedChange, disabled }: CheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn(
        "h-[18px] w-[18px] shrink-0 rounded-[5px] border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 flex items-center justify-center",
        checked
          ? "bg-neutral-900 border-neutral-900 dark:bg-neutral-100 dark:border-neutral-100"
          : "border-neutral-300 dark:border-neutral-700 bg-transparent hover:border-neutral-400 dark:hover:border-neutral-600",
        className
      )}
    >
      <AnimatePresence>
        {checked && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 28 }}
          >
            <Check className="h-3 w-3 text-white dark:text-neutral-900" strokeWidth={3} />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}
