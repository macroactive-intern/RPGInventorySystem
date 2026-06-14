# RPG Inventory System

A browser-based RPG inventory UI built with Next.js, React, Zustand, and @dnd-kit. Supports drag-and-drop item management across backpack slots, equipment slots, a hotbar, a crafting panel, and a trade panel.

## Prerequisites

- Node.js 20+
- npm 10+

## Setup

```bash
git clone <repo-url>
cd rpg-inventory-system
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

No environment variables are required. Copy `.env.example` to `.env` if you add any in future.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm start` | Start the production server (requires build first) |
| `npm test` | Run unit tests (Vitest) |
| `npm run test:e2e` | Run end-to-end tests (Playwright) |
| `npm run lint` | Run ESLint via `next lint` |
| `npx tsc --noEmit` | Run the TypeScript type checker |

## Testing

Unit tests live alongside their source files in `lib/` and `store/`. Run them with:

```bash
npm test
```

End-to-end tests live in `e2e/`. They require a built app or a running dev server:

```bash
npm run test:e2e
```
