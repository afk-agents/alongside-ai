# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Run both Next.js and Convex dev servers (two terminal windows needed)
bun run dev          # Start Next.js dev server on localhost:3000
bunx convex dev      # Start Convex dev server (watches for changes)

# Other commands
bun run build        # Production build
bun run lint         # Run ESLint
bun run test         # Run tests
```

## Architecture

This is a **Next.js 16** application using **Convex** as the backend (real-time database + serverless functions).

### Frontend (`app/`)
- Uses Next.js App Router with React 19
- `ConvexClientProvider.tsx` wraps the app to provide Convex client context
- Tailwind CSS v4 for styling

### Backend (`convex/`)
- **Schema**: `convex/schema.ts` - defines database tables with Convex validators
- **Functions**: Query, mutation, and action functions (file-based routing)
- **Auth**: Password-based authentication via `@convex-dev/auth`
  - `auth.ts` - exports auth helpers (`auth`, `signIn`, `signOut`, `store`, `isAuthenticated`)
  - `auth.config.ts` - configures auth providers
  - `authTables` spread into schema provides user/session tables

### Key Convex Patterns
- Use `v.` validators for all function args and returns (e.g., `v.string()`, `v.id("tableName")`)
- Always include `returns` validator, use `v.null()` for void functions
- Use `internalQuery/Mutation/Action` for private functions, `query/mutation/action` for public API
- Reference functions via `api.filename.functionName` (public) or `internal.filename.functionName` (private)
- Use `withIndex()` instead of `filter()` for queries - define indexes in schema first

### Path Aliases
- `@/*` maps to project root (e.g., `@/convex/schema`)

## Environment
- Requires `.env.local` with `NEXT_PUBLIC_CONVEX_URL` for Convex connection
