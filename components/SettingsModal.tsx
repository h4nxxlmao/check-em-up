"use client"

import * as React from "react"
import { Dialog, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useSettings } from "@/hooks/useSettings"
import { useAppStore } from "@/stores/useAppStore"
import { Checkbox } from "@/components/ui/checkbox"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

export function SettingsModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { settings, updateSettings } = useSettings();
  const exportData = useAppStore(state => state.exportData);
  const importData = useAppStore(state => state.importData);
  const { setTheme } = useTheme();

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    const json = await exportData();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `check-em-up-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const json = event.target?.result as string;
      if (json) {
        const success = await importData(json);
        if (success) {
          onOpenChange(false);
        } else {
          alert("Couldn't import — invalid file.");
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader onClose={() => onOpenChange(false)}>
        <DialogTitle>Settings</DialogTitle>
      </DialogHeader>

      <div className="space-y-5">
        <Section label="Theme">
          <div className="flex gap-1.5">
            {(['system', 'light', 'dark'] as const).map(t => (
              <button
                key={t}
                onClick={() => { updateSettings({ theme: t }); setTheme(t); }}
                className={cn(
                  "flex-1 h-8 rounded-lg text-sm capitalize transition-colors",
                  settings.theme === t
                    ? "bg-neutral-900 text-neutral-50 dark:bg-neutral-50 dark:text-neutral-900"
                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </Section>

        <Section label="Sound">
          <label className="flex items-center gap-3 cursor-pointer">
            <Checkbox
              checked={settings.soundEnabled}
              onCheckedChange={(checked) => updateSettings({ soundEnabled: checked })}
            />
            <span className="text-sm text-neutral-700 dark:text-neutral-300">Play sound on complete</span>
          </label>
        </Section>

        <Section label="Data">
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="flex-1 h-8 rounded-lg text-sm bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
            >
              Export
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 h-8 rounded-lg text-sm bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
            >
              Import
            </button>
            <input type="file" accept=".json" className="hidden" ref={fileInputRef} onChange={handleImport} />
          </div>
          <p className="text-xs text-neutral-400 dark:text-neutral-600 mt-2">
            Data stays on your device.
          </p>
        </Section>
      </div>
    </Dialog>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2.5">
      <p className="text-xs font-medium text-neutral-400 dark:text-neutral-600 uppercase tracking-wider">{label}</p>
      {children}
    </div>
  );
}
