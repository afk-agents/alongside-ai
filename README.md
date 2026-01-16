# Alongside AI

A community-driven platform for tech professionals evolving into sovereign creators, working alongside AI.

**Website:** alongs.ai

## Documentation

- [Master PRD](ai-docs/Alongside_AI-MASTER_PRD.md) - Full product requirements
- [Feature List](ai-docs/Alongside_AI-FEATURE-LIST.md) - Detailed feature specifications

## Tech Stack

- **Frontend:** Next.js 16, React 19, Tailwind CSS 4
- **Backend:** Convex (real-time database + serverless functions)
- **Auth:** @convex-dev/auth (Password provider)
- **Payments:** Stripe Checkout

## Development

```bash
# Install dependencies
bun install

# Run Next.js dev server
bun run dev

# Run Convex dev server (separate terminal)
bunx convex dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Feature Roadmap

### Phase 1: MVP Launch

- [x] F01: Database schema and core models
- [ ] F02: Authentication system (email/password)
- [ ] F03: App shell and navigation
- [ ] F04: Tag system
- [ ] F05: Founder profiles and About page
- [ ] F06: Blog/Articles section
- [ ] F07: Projects showcase (The Lab)
- [ ] F08: Learn section (videos/resources)
- [ ] F09: Event listing and detail pages
- [ ] F10: Stripe Checkout integration
- [ ] F11: Event registration flow
- [ ] F12: Discount code system
- [ ] F13: Post-purchase experience
- [ ] F14: Homepage
- [ ] F15: Site-wide search
- [ ] F16: Testimonials
- [ ] F17: Newsletter signup
- [ ] F18: Admin dashboard shell
- [ ] F19: Admin content management
- [ ] F20: Admin event management
- [ ] F21: Standard pages (Contact, Privacy, Terms, FAQ)

### Phase 2: Community Foundation

- [ ] F22: Member profile system
- [ ] F23: Profile unlock workflow
- [ ] F24: Community directory
- [ ] F25: Experiments section
- [ ] F26: Admin user management

### Phase 3: Community Growth

- [ ] F27: Community content submission
- [ ] F28: Paid courses
- [ ] F29: Membership tiers
- [ ] F30: Event sponsorship display

### Phase 4: Platform Maturity

- [ ] F31: Event cohort spaces
- [ ] F32: Direct messaging
- [ ] F33: Advanced analytics
