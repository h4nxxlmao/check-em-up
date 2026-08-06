import * as React from "react"
import * as ReactDOM from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!mounted) return null;

  return ReactDOM.createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            className="relative z-50 w-full max-w-md mx-4 mb-4 sm:mb-0 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/60 shadow-xl shadow-black/[0.08] dark:shadow-black/40 p-5"
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export function DialogHeader({ className, children, onClose }: { className?: string; children: React.ReactNode; onClose?: () => void }) {
  return (
    <div className={cn("flex items-start justify-between mb-5", className)}>
      <div>{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors -mr-1"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export function DialogTitle({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <h2 className={cn("text-base font-semibold text-neutral-900 dark:text-neutral-100", className)}>
      {children}
    </h2>
  );
}

export function DialogDescription({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <p className={cn("text-sm text-neutral-500 dark:text-neutral-500 mt-0.5", className)}>
      {children}
    </p>
  );
}

export function DialogFooter({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("flex items-center justify-end gap-2 mt-5 pt-4 border-t border-neutral-100 dark:border-neutral-800", className)}>
      {children}
    </div>
  );
}
