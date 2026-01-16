# Relentless Agent Instructions

You are an autonomous coding agent working on **Alongside AI**, a Next.js 16 + Convex application.

---

## CRITICAL: Quality Gates (Non-Negotiable)

Before marking ANY story as complete, run these commands:

```bash
# TypeScript type checking
bunx tsc --noEmit

# Linting
bun run lint

# Tests (if applicable)
bun test
```

**If ANY check fails, DO NOT mark the story as complete.**

---

## Your Task (Per Iteration)

1. Read `relentless/features/<feature>/prd.json`
2. Read `relentless/features/<feature>/progress.txt`
3. Check you're on the correct branch from PRD `branchName`
4. Pick the **highest priority** story where `passes: false`
5. Review existing code to understand patterns
6. **Write tests first** (TDD workflow)
7. Implement the story
8. Run ALL quality checks
9. If ALL checks pass, commit: `feat: [Story ID] - [Story Title]`
10. Update PRD: set `passes: true`
11. Append progress to `progress.txt`

---

## Tech Stack Quick Reference

### Frontend (Next.js 16 + React 19)
- **Pages**: `app/` directory (App Router)
- **Styling**: Tailwind CSS 4
- **Convex Client**: Wrap app in `ConvexClientProvider`
- **Server Components**: Default, use `"use client"` sparingly

### Backend (Convex)
- **Schema**: `convex/schema.ts` - define tables with validators
- **Functions**: Domain-based files (`convex/users.ts`, `convex/messages.ts`)
- **Auth**: `@convex-dev/auth` with Password provider

### Key Convex Patterns
```typescript
// Always include args AND returns validators
export const myQuery = query({
  args: { userId: v.id("users") },
  returns: v.object({ name: v.string() }),
  handler: async (ctx, args) => {
    // Use withIndex, not filter
    const user = await ctx.db.get(args.userId);
    return { name: user?.name ?? "" };
  },
});

// Use v.null() for void returns
export const myMutation = mutation({
  args: { text: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.insert("messages", { text: args.text });
    return null;
  },
});

// Use internal* for private functions
export const internalFn = internalQuery({
  args: {},
  returns: v.null(),
  handler: async (ctx) => null,
});
```

---

## TDD Workflow

For each story:

1. **Write test first** - Define expected behavior
2. **Run test** - Confirm it fails (red)
3. **Implement minimum code** - Make test pass (green)
4. **Refactor** - Clean up while tests pass
5. **Run all quality checks**

---

## Quality Checklist

Before marking a story complete:

- [ ] Tests written and passing
- [ ] `bunx tsc --noEmit` passes (0 errors)
- [ ] `bun run lint` passes (0 warnings)
- [ ] No debug code (console.log, debugger)
- [ ] No unused imports or variables
- [ ] Follows existing patterns in codebase
- [ ] Convex functions have args AND returns validators

---

## Progress Report Format

APPEND to `progress.txt`:

```markdown
## [Date/Time] - [Story ID]

**Implemented:**
- What was done

**Files Changed:**
- List of modified files

**Learnings:**
- Patterns discovered
- Gotchas encountered
- Notes for future iterations

---
```

---

## Stop Condition

After completing a story, check if ALL stories have `passes: true`.

If ALL complete:
```
<promise>COMPLETE</promise>
```

Otherwise, end normally (next iteration continues).

---

## Common Pitfalls

1. **Don't use `filter()` in Convex queries** - Define an index and use `withIndex()`
2. **Don't forget `returns` validator** - All Convex functions need it, use `v.null()` for void
3. **Don't use `any` types** - Use proper types or `unknown`
4. **Don't skip tests** - TDD is required per constitution
5. **Don't use API routes** - Use Convex functions for backend logic

---

**Personalized for Alongside AI**
**Generated:** 2026-01-16
**Re-generate:** `/relentless.constitution`
