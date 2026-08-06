import * as React from "react"
import { Navigation } from "./Navigation"

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 transition-colors duration-200">
      <main className="max-w-xl mx-auto px-5 pt-14 pb-28">
        {children}
      </main>
      <Navigation />
    </div>
  );
}
