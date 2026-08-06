# Check Em 'Up

> "A lightweight, beautiful, local-first checklist maker."

Simple checklists. Zero accounts. Just check 'em up.

## Overview
Check Em 'Up is a production-ready, local-first web application designed to help you quickly create and manage checklists. It requires no login, no backend, and no servers. All your data lives securely in your device's IndexedDB.

## Features
- **Local First**: Everything is stored directly in your browser. Fast and completely offline capable.
- **Beautiful UI**: Designed to feel like a premium macOS application with smooth Framer Motion animations.
- **Dark Mode**: Instantly switch between light and dark themes based on your system preference.
- **Drag & Drop**: Easily reorder checklists and tasks.
- **Instant Search**: Find any task or checklist quickly.
- **Subtle Audio Cues**: Pleasant sounds and haptics when completing tasks (configurable in settings).
- **Data Portability**: Easily export and import your checklists as JSON files.

## Tech Stack
- [Next.js](https://nextjs.org) (App Router)
- [React](https://react.dev)
- [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion)
- [Zustand](https://github.com/pmndrs/zustand)
- [idb](https://github.com/jakearchibald/idb) (IndexedDB)
- [dnd-kit](https://dndkit.com)

## Local Development
1. Clone the repository
2. Install dependencies: `pnpm install`
3. Run the development server: `pnpm dev`
4. Open [http://localhost:3000](http://localhost:3000)

## Folder Structure
```
app/               - Next.js App Router pages and layout
components/        - Reusable React components (UI, Layout, Checklist)
hooks/             - Custom React hooks
lib/               - Utilities and IndexedDB wrappers
public/            - Static assets (sounds, icons)
stores/            - Zustand global state management
types/             - TypeScript type definitions
```

## Contributing
Please see `CONTRIBUTING.md` for details on how to contribute to this project. We follow the Contributor Covenant `CODE_OF_CONDUCT.md`.

## License
MIT License. See `LICENSE` for details.
