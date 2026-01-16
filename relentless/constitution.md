# Project Constitution

## Overview

**Project:** Alongside AI
**Version:** 1.0.0
**Ratified:** 2026-01-16
**Last Amended:** 2026-01-16

This document defines the governing principles, patterns, and constraints for this project. All agents and developers MUST follow these guidelines when working on the codebase.

## Technology Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **Tailwind CSS 4** - Utility-first styling
- **TypeScript** - Type-safe JavaScript

### Backend
- **Convex** - Real-time database and serverless functions
- **@convex-dev/auth** - Authentication (Password provider)

### Tooling
- **Bun** - Package manager and runtime
- **ESLint** - Code linting

## Core Principles

### Principle 1: Type Safety

**MUST:**
- All code must pass TypeScript strict mode with 0 errors
- No `any` types except in documented, unavoidable cases
- All Convex functions must have `args` and `returns` validators
- Use `v.null()` for functions that return void

**SHOULD:**
- Prefer type inference over explicit annotations where clear
- Use `Id<"tableName">` for document IDs, not `string`
- Export types alongside implementations

**Rationale:** Type safety prevents runtime errors, improves maintainability, and enables better IDE support.

### Principle 2: Testing (TDD)

**MUST:**
- Write tests before implementation for new features
- All new features must include appropriate tests
- Tests must pass before merging
- Test edge cases and error conditions

**SHOULD:**
- Aim for >80% coverage on business logic
- Use descriptive test names that explain behavior
- Keep tests focused and independent

**Rationale:** TDD ensures code correctness, documents expected behavior, and prevents regressions.

### Principle 3: Code Quality

**MUST:**
- All commits must pass: `bun run lint` with 0 warnings
- All commits must pass: TypeScript typecheck with 0 errors
- All commits must pass: Tests
- Code must be formatted consistently

**SHOULD:**
- Keep functions small and focused (single responsibility)
- Write self-documenting code with clear naming
- Remove unused code, imports, and variables

**Rationale:** Consistent quality standards reduce bugs and make code easier to maintain.

### Principle 4: Architecture (Next.js App Router)

**MUST:**
- Follow Next.js App Router conventions
- Place pages in `app/` directory
- Use `"use client"` directive only when necessary
- Keep server components as the default

**SHOULD:**
- Organize shared components in root `components/`
- Keep API logic in Convex functions, not API routes

**Rationale:** Following framework conventions makes code predictable and leverages built-in optimizations.

### Principle 5: Convex Backend (Domain-based)

**MUST:**
- Define schema in `convex/schema.ts`
- Always include `args` and `returns` validators on all functions
- Use `withIndex()` instead of `filter()` for queries
- Use `internalQuery/Mutation/Action` for private functions
- Reference functions via `api.filename.fn` or `internal.filename.fn`

**SHOULD:**
- Organize functions by domain: `convex/users.ts`, `convex/messages.ts`
- Include index fields in index names: `by_userId_and_createdAt`
- Validate at system boundaries

**Rationale:** Domain-based organization scales well and makes code discoverable.

### Principle 6: Version Control

**MUST:**
- Use Conventional Commits format: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`
- Write clear, descriptive commit messages
- Keep commits focused and atomic
- Do not commit broken code

**SHOULD:**
- Reference issue/story IDs when applicable
- Keep commit history clean and meaningful
- Update documentation with code changes

**Rationale:** Clear commit history enables effective code review and debugging.

## Quality Gates

Before any commit, ALL of the following must pass:

```bash
# TypeScript
bunx tsc --noEmit

# Linting
bun run lint

# Tests (when applicable)
bun test
```

**If ANY check fails, DO NOT commit.**

## File Organization

```
alongside-ai/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Home page
│   ├── globals.css        # Global styles
│   └── ConvexClientProvider.tsx
├── convex/                 # Convex backend
│   ├── _generated/        # Auto-generated types
│   ├── schema.ts          # Database schema
│   ├── auth.ts            # Auth configuration
│   └── [domain].ts        # Domain-specific functions
├── relentless/            # Relentless workspace
│   ├── constitution.md    # This file
│   ├── prompt.md          # Agent instructions
│   └── features/          # Feature PRDs
└── ai-docs/               # AI assistant documentation
```

## Constraints

### Dependencies

**MUST NOT:**
- Add dependencies without clear justification
- Include deprecated packages
- Use packages with known security issues

**SHOULD:**
- Prefer built-in solutions over dependencies
- Keep dependencies minimal and focused
- Regularly update dependencies

### Security

**MUST:**
- No secrets committed to git (use `.env.local`)
- Proper input validation on all user inputs
- Use Convex auth for protected operations

**SHOULD:**
- Validate at system boundaries
- Use internal functions for sensitive operations

## Agent-Specific Guidelines

### For All Agents

**MUST:**
- Read `progress.txt` before starting work
- Work on ONE story per iteration
- Update PRD after completing a story
- Append learnings to `progress.txt`
- Run ALL quality checks before committing

**SHOULD:**
- Review existing code before modifying
- Follow established patterns in the codebase
- Document non-obvious decisions

### Iteration Workflow

1. Read PRD to find next incomplete story (`passes: false`)
2. Read `progress.txt` for context and patterns
3. Review relevant existing code
4. Write tests first (TDD)
5. Implement the story
6. Run quality checks: typecheck, lint, test
7. Commit with Conventional Commit format
8. Update PRD: set `passes: true`
9. Append to `progress.txt`
10. Check if all stories complete

## Governance

### Amendment Process

1. Propose changes via PR to `relentless/constitution.md`
2. Document rationale for changes
3. Update version semantically:
   - **MAJOR**: Breaking changes to principles
   - **MINOR**: New principles added
   - **PATCH**: Clarifications, typo fixes
4. Update `Last Amended` date

### Compliance

- Constitution referenced during feature specification and planning
- Violations should be addressed before merging
- Regular review at project milestones
