# AGENTS.md

## Project Overview

Next.js 16 (App Router) + Convex backend + Clerk authentication + Tailwind CSS v4 + shadcn/ui.
Package manager: **pnpm**. All source code lives under `src/`.

## Build, Lint, and Dev Commands

```bash
pnpm dev              # Start frontend (Next.js) and backend (Convex) in parallel
pnpm dev:frontend     # Next.js dev server only
pnpm dev:backend      # Convex dev server only
pnpm build            # Production build (next build)
pnpm lint             # ESLint check
pnpm lint:fix         # ESLint auto-fix
pnpm format:check     # Prettier check
pnpm format:write     # Prettier auto-format
pnpm start            # Start production server
```

No test runner is configured. If tests are added, prefer Vitest.

## Project Structure

```
src/
  app/                   # Next.js App Router (route groups, layouts, pages)
    (auth)/              # Auth pages (sign-in, sign-up) — unauthenticated
    (protected)/         # Pages requiring authentication
    (public)/            # Public-facing pages
  components/            # React components
    ui/                  # shadcn/ui components (do NOT manually edit)
  convex/                # Convex backend functions and schema
    _generated/          # Auto-generated types and API (do NOT edit)
    schema.ts            # Database schema definition
    auth.config.ts       # Clerk JWT auth configuration
  hooks/                 # Custom React hooks
  lib/                   # Utilities (cn helper, etc.)
  env.ts                 # Type-safe env vars (@t3-oss/env-nextjs + Zod)
  proxy.ts               # Clerk middleware (route protection)
next.config.ts           # Enables reactCompiler and typedRoutes
```

## Code Style and Conventions

### TypeScript

- Strict mode enabled in both root and `src/convex` tsconfigs.
- Path alias: `@/*` maps to `./src/*`.
- Prefer `type` imports: `import type { Metadata } from "next"`.
- Use `Readonly<>` for component props: `Readonly<{ children: React.ReactNode }>`.
- React Compiler is enabled — avoid manual `useMemo`/`useCallback`.
- Typed routes are enabled — use `Route` type for links.

### Formatting (Prettier — `.prettierrc`)

- 2-space indentation, double quotes, semicolons required, trailing commas (ES5).
- Import sorting via `@trivago/prettier-plugin-sort-imports`:
  Order: react/next → third-party → `@/` aliases → relative.
  Groups are separated by blank lines.
- Tailwind class sorting via `prettier-plugin-tailwindcss`.

### ESLint Rules (flat config — `eslint.config.mjs`)

- Extends: `next/core-web-vitals`, `next/typescript`, `@convex-dev/eslint-plugin`, `prettier`.
- `prefer-arrow-callback`: error — use arrow functions for callbacks.
- `prefer-template`: error — use template literals, not string concatenation.
- `n/no-process-env`: error — use `@/env` instead of raw `process.env` (disabled in `src/convex/` and `src/env.ts`).

### Imports

- Order enforced by Prettier plugin: react/next, third-party, `@/*`, relative.
- Inside `src/convex/`: import from `"./_generated/server"` and `"./_generated/api"`.
- In frontend code: import Convex API from `"@/convex/_generated/api"`.
- Import React namespace in shadcn patterns: `import * as React from "react"`.

### React / Next.js Patterns

- Server Components are the default. Add `"use client"` only when needed.
- Provider order in `src/app/layout.tsx`: ThemeProvider > ClerkProvider > ConvexClientProvider > TooltipProvider.
- Named exports for components. Default exports for pages and layouts.
- Use `cn()` from `@/lib/utils` for conditional class merging (clsx + tailwind-merge).
- Add shadcn/ui components via `pnpm dlx shadcn@latest add <component>`, never edit `components/ui/` manually.

### Tailwind CSS v4

- CSS-first config in `src/app/globals.css` using `@theme inline { ... }`.
- No `tailwind.config.ts`. All theme tokens are CSS custom properties.

### Naming Conventions

- Files: kebab-case (`convex-client-provider.tsx`, `use-mobile.ts`).
- Components: PascalCase (`ConvexClientProvider`).
- Hooks: camelCase with `use` prefix (`useIsMobile`).
- Convex functions: camelCase (`listNumbers`, `addNumber`).
- Convex indexes: `by_field` or `by_field1_and_field2`.

### Error Handling

- Convex mutations validate existence: `if (!entity) throw new Error("Not found")`.
- Always include argument validators on all Convex functions.
- Use `void` prefix for fire-and-forget promises: `void addNumber({ value: 1 })`.

## Convex Backend Guidelines

Source: `.cursor/rules/convex_rules.mdc`. These are critical.

### Functions

- Always use object syntax: `query({ args: {}, handler: async (ctx, args) => {} })`.
- Always include `args` validators, even if empty (`args: {}`).
- `query`/`mutation`/`action` = public; `internalQuery`/`internalMutation`/`internalAction` = private.
- Never use `ctx.db` inside actions. Use `ctx.runQuery`/`ctx.runMutation`.
- `"use node";` at top of files needing Node.js built-ins. Never mix with queries/mutations.
- Reference functions via `api.file.functionName` or `internal.file.functionName`. Never pass functions directly.

### Schema

- Define in `src/convex/schema.ts` using `defineSchema`/`defineTable`.
- `_id` and `_creationTime` are automatic — don't define them.
- Index names must list all fields: `by_channel_and_author` for `["channelId", "authorId"]`.

### Queries

- Never use `.filter()`. Always use `.withIndex()` with a defined index.
- `.order("desc")` / `.order("asc")` for ordering. Default is ascending by `_creationTime`.
- `.unique()` for single-doc lookups, `.take(n)` for limited results.
- No `.delete()` on queries. Collect results and delete individually.

### Mutations

- `ctx.db.patch(id, fields)` for partial updates; `ctx.db.replace(id, doc)` for full replacement.

### Actions

- `ctx.scheduler.runAfter(0, functionRef, args)` for async work from mutations.
- Only call action from action to cross runtimes (V8 <-> Node).

### Validators

- `v.int64()` not deprecated `v.bigint()`. `v.record(keys, values)` for dynamic keys.
- `v.id("tableName")` for document IDs, not `v.string()`.
- `undefined` is not valid in Convex — use `null` / `v.null()`.

## Authentication (Clerk)

- Middleware in `src/proxy.ts` protects all routes except auth and public.
- Convex uses Clerk JWT via `ConvexProviderWithClerk` in `src/components/convex-client-provider.tsx`.
- Access identity in Convex: `ctx.auth.getUserIdentity()`.
- Auth config: `src/convex/auth.config.ts` using `CLERK_JWT_ISSUER_DOMAIN` env var.

## Environment Variables

Validated at build time via `@t3-oss/env-nextjs` in `src/env.ts`. Always import from `@/env` — never use `process.env` directly (enforced by `n/no-process-env` lint rule). Never commit `.env.local` (gitignored).

Required: `CONVEX_DEPLOYMENT`, `NEXT_PUBLIC_CONVEX_URL`, `NEXT_PUBLIC_CONVEX_SITE_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_SIGN_IN_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL`.
