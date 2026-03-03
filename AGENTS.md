# AGENTS.md

## Project Overview

Next.js 16 (App Router) + Convex backend + Clerk authentication + Tailwind CSS v4 + shadcn/ui.
Package manager: **pnpm**. No test framework is configured.

## Build, Lint, and Dev Commands

```bash
pnpm dev              # Start frontend (Next.js) and backend (Convex) in parallel
pnpm dev:frontend     # Next.js dev server only
pnpm dev:backend      # Convex dev server only
pnpm build            # Production build (next build)
pnpm lint             # ESLint (flat config: next/core-web-vitals + next/typescript + @convex-dev/eslint-plugin)
pnpm start            # Start production server
```

There is no test runner configured. No `vitest`, `jest`, or testing libraries are installed.
If tests are added, prefer Vitest for consistency with the ESM/TypeScript toolchain.

## Project Structure

```
app/                   # Next.js App Router (route groups, layouts, pages)
  (auth)/              # Auth pages (sign-in, sign-up) - unauthenticated
  (protected)/         # Pages requiring authentication
  (public)/            # Public-facing pages
components/            # React components
  ui/                  # shadcn/ui components (do NOT manually edit these)
convex/                # Convex backend functions and schema
  _generated/          # Auto-generated types and API (do NOT edit)
  schema.ts            # Database schema definition
  auth.config.ts       # Clerk JWT auth configuration
hooks/                 # Custom React hooks
lib/                   # Utilities (cn helper, etc.)
proxy.ts               # Clerk middleware (route protection)
```

## Code Style and Conventions

### TypeScript

- Strict mode enabled (`"strict": true` in both root and convex tsconfigs).
- Use `@/*` path aliases for imports (maps to project root).
- Prefer `type` imports for type-only usage: `import type { Metadata } from "next"`.
- Use `Readonly<>` for component props: `{ children }: Readonly<{ children: React.ReactNode }>`.
- Layout components use the global `LayoutProps<"/">` type for their props.

### Formatting (Prettier defaults)

- 2-space indentation (configured in `.vscode/settings.json`).
- Double quotes for strings (Prettier default).
- Trailing commas in ES5 positions.
- Semicolons required.
- Format on save is enabled; organize imports on save.

### Imports

- Order: external packages first, then `@/*` aliased local imports, then relative imports.
- Import React utilities as namespace when from shadcn patterns: `import * as React from "react"`.
- Import Convex server functions from `"./_generated/server"` inside `convex/`.
- Import API references from `"./_generated/api"` inside `convex/`.
- Import Convex API from `"@/convex/_generated/api"` in frontend code.

### React / Next.js Patterns

- App Router with route groups: `(auth)`, `(public)`, `(protected)`.
- Server Components are the default. Add `"use client"` directive only when needed.
- Providers are composed in `app/layout.tsx`: ThemeProvider > ClerkProvider > ConvexClientProvider > TooltipProvider.
- Use `preloadQuery` / `preloadedQueryResult` in server components, `usePreloadedQuery` / `useMutation` in client components.
- Named exports for components (e.g., `export function Header()`). Default exports for pages and layouts.
- Use `cn()` from `@/lib/utils` for conditional class merging (clsx + tailwind-merge).
- shadcn/ui components live in `components/ui/` and should be added via `pnpm dlx shadcn@latest add <component>`, not manually edited.

### Tailwind CSS v4

- CSS-first configuration in `app/globals.css` using `@theme inline { ... }`.
- No `tailwind.config.ts` file. All theme tokens are CSS custom properties.
- Use Tailwind utility classes directly. Use `cn()` for conditional styling.

### Naming Conventions

- Files: kebab-case for all files (`convex-client-provider.tsx`, `use-mobile.ts`).
- Components: PascalCase for component names (`ConvexClientProvider`, `Header`).
- Hooks: camelCase with `use` prefix (`useIsMobile`).
- Convex functions: camelCase (`listNumbers`, `addNumber`, `myAction`).
- Convex indexes: snake*case with `by*` prefix describing fields (`by_channel`, `by_field1_and_field2`).

### Error Handling

- Convex mutations validate existence before operating: `if (!entity) throw new Error("Not found")`.
- Always include argument validators on all Convex functions (queries, mutations, actions).
- Use `void` prefix for fire-and-forget promises in event handlers: `void addNumber({ value: 1 })`.

## Convex Backend Guidelines

These rules come from `.cursor/rules/convex_rules.mdc` and are critical:

### Functions

- Always use the object syntax: `query({ args: {}, handler: async (ctx, args) => {} })`.
- Always include `args` validators, even if empty (`args: {}`).
- Use `query`/`mutation`/`action` for public functions, `internalQuery`/`internalMutation`/`internalAction` for private.
- Never use `ctx.db` inside actions. Actions access data via `ctx.runQuery`/`ctx.runMutation`.
- Add `"use node";` at top of files with actions that need Node.js built-ins. Never mix `"use node"` with queries/mutations in the same file.
- Reference functions via `api.file.functionName` (public) or `internal.file.functionName` (private). Never pass functions directly.

### Schema

- Define schema in `convex/schema.ts` using `defineSchema`/`defineTable`.
- System fields `_id` and `_creationTime` are automatic; don't define them.
- Index names must include all fields: e.g., `by_channel_and_author` for `["channelId", "authorId"]`.

### Queries

- Never use `.filter()`. Always define an index and use `.withIndex()`.
- Use `.order("desc")` or `.order("asc")` for ordering. Default is ascending by `_creationTime`.
- Use `.unique()` for single-document lookups, `.take(n)` for limited results.
- Convex queries don't support `.delete()`. Collect results and delete individually.

### Mutations

- `ctx.db.patch(id, fields)` for partial updates; `ctx.db.replace(id, doc)` for full replacement.
- Both throw if the document doesn't exist.

### Actions

- Use `ctx.scheduler.runAfter(0, functionRef, args)` to trigger async work from mutations.
- Only call an action from another action to cross runtimes (V8 <-> Node). Otherwise extract shared logic into helper functions.

### Validators

- Use `v.int64()` (not deprecated `v.bigint()`).
- Use `v.record(keys, values)` for dynamic key objects. No `v.map()` or `v.set()`.
- Use `v.id("tableName")` for document IDs, not `v.string()`.
- `undefined` is not a valid Convex value; use `null` and `v.null()`.

## Authentication (Clerk)

- Clerk middleware in `proxy.ts` protects all routes except `(auth)` and `(public)`.
- Convex uses Clerk JWT via `ConvexProviderWithClerk` in `components/convex-client-provider.tsx`.
- Access user identity in Convex via `ctx.auth.getUserIdentity()`.
- Auth config is in `convex/auth.config.ts` using `CLERK_JWT_ISSUER_DOMAIN` env var.

## Environment Variables

Required variables (see `.env.example`):

- `CONVEX_DEPLOYMENT` - Convex deployment identifier
- `NEXT_PUBLIC_CONVEX_URL` - Convex deployment URL
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk public key
- `CLERK_SECRET_KEY` - Clerk secret key
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`

Never commit `.env.local` or files matching `.env*` (they are gitignored).
