"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Settings, Home, Plus } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { useChecklists } from "@/hooks/useChecklists"
import { v4 as uuidv4 } from "uuid"
import { SettingsModal } from "@/components/SettingsModal"
import { cn } from "@/lib/utils"

export function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { addChecklist, activeChecklists } = useChecklists();
  const [settingsOpen, setSettingsOpen] = React.useState(false);

  const isHome = pathname === "/";

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
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 35, delay: 0.1 }}
          className="flex items-center gap-1 p-1.5 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 shadow-lg shadow-black/[0.06] dark:shadow-black/30"
        >
          <NavItem
            icon={<Home className="h-[18px] w-[18px]" />}
            label="Home"
            isActive={isHome}
            onClick={() => router.push("/")}
          />

          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={createChecklist}
            className="flex items-center justify-center h-10 w-10 rounded-[10px] bg-neutral-900 text-neutral-50 dark:bg-neutral-50 dark:text-neutral-900 mx-0.5"
            aria-label="New list"
          >
            <Plus className="h-5 w-5" />
          </motion.button>

          <NavItem
            icon={<Settings className="h-[18px] w-[18px]" />}
            label="Settings"
            isActive={settingsOpen}
            onClick={() => setSettingsOpen(true)}
          />
        </motion.div>
      </div>

      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}

function NavItem({ icon, label, isActive, onClick }: { icon: React.ReactNode; label: string; isActive: boolean; onClick: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.93 }}
      onClick={onClick}
      title={label}
      className={cn(
        "flex items-center justify-center h-10 w-10 rounded-[10px] transition-colors",
        isActive
          ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50"
          : "text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
      )}
    >
      {icon}
    </motion.button>
  );
}
