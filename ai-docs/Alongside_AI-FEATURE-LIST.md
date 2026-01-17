# Alongside AI - Feature Specifications

Detailed feature specifications from the [Master PRD](Alongside_AI-MASTER_PRD.md), in recommended implementation order.

**Usage:** Run `/relentless.specify "feature description"` for each item when ready to implement.

---

## Phase 1: MVP Launch

### Foundation

- [x] **Database Schema & Core Models**
Define Convex schema for users, events, content types (projects, articles, videos), tags, testimonials. Establish role system (admin, member, guest).

- [x] **Authentication System**
Email/password authentication using @convex-dev/auth. Auto-create accounts on purchase. Login/logout flows. Role-based authorization.

- [x] **App Shell & Navigation**
Root layout with header, footer, primary navigation (Home, Events, Lab, Learn, Blog, About). Secondary nav (Search, Login/Account). Mobile-responsive hamburger menu.

### Content Foundation

- [x] **Tag System**
Unified taxonomy across all content types. Tag pages showing all content with that tag. Clickable tags on content items.

- [x] **Founder Profiles & About Page**
About page with mission, values, and founder bios (David & Nathan). Founder profiles as the template for future member profiles.

### Content Sections

- [x] **Blog/Articles Section**
Article listing page with filtering. Individual article pages with rich formatting. Author attribution. Related content links. Substack sync (manual or RSS initially).

- [ ] **Projects Showcase (The Lab)**
Project listing page. Individual project detail pages with: title, description, hero image/video, case study narrative, links, YouTube embeds, tags, author attribution.

- [ ] **Learn Section**
Videos page with YouTube embeds organized into playlists/series. Free resources listing (downloadable guides, cheat sheets). Browse by topic tags.

### Events System

- [ ] **Event Listing & Detail Pages**
Event listing page filterable by type, date, format. Event detail page with: title, date/time/timezone, location, description, agenda, speaker profiles, price, tags. Past events archive.

- [ ] **Stripe Checkout Integration**
Stripe Checkout for payment processing. Product/price configuration. Webhook handling for successful payments.

- [ ] **Event Registration Flow**
Guest checkout (no account required upfront). Collect name, email, discount code field. Auto-create account on purchase. Confirmation page with next steps.

- [ ] **Discount Code System**
Create/manage discount codes. Percentage or fixed amount discounts. Codes can reduce to $0. Usage limits and expiration dates. Apply at checkout.

- [ ] **Post-Purchase Experience**
Confirmation email with event details. Calendar invite (ICS file or Google Calendar link). Access to pre-event materials. Account credentials delivery.

### Homepage & Discovery

- [ ] **Homepage**
Hero section with tagline and primary CTA. Upcoming events section. Featured content (projects, videos, articles). About/founders brief. Testimonials section. Newsletter CTA.

- [ ] **Site-Wide Search**
Search across events, projects, articles, videos. Results grouped by content type. Search box in header navigation.

- [ ] **Testimonials**
Testimonial data model. Testimonial cards with quotes, attribution (name, role, photo). Display on homepage, event pages, about page.

### Newsletter

- [ ] **Newsletter Signup & Email Capture**
Email signup form components. Placements: homepage, footer, article footers, Learn section. Welcome email flow. Integration with email service.

### Admin Features

- [ ] **Admin Dashboard Shell**
Admin-only route protection. Dashboard layout with sidebar navigation. Quick stats overview.

- [ ] **Admin: Content Management**
CRUD for projects. CRUD for videos/resources. Tag management. Feature and unfeature content. LinkedIn post embed management.

- [ ] **Admin: Event Management**
CRUD for events. Pricing and discount code management. View attendee list. Event duplication. Archive functionality.

### Static Pages

- [ ] **Standard Pages**
Contact page with form. Privacy Policy page. Terms of Service page. FAQ page.

---

## Phase 2: Community Foundation

- [ ] **Member Profile System**
Profile fields: display name, photo, bio, social links, "working on now", skills, location. Profile visibility states (locked, unlocked, published).

- [ ] **Profile Unlock Workflow**
Admin can unlock profiles for event attendees. Bulk unlock for event cohorts. Email notification when profile unlocked.

- [ ] **Community Directory**
Directory page (visible to unlocked members only). Search by skills, location, interests. Display only published profiles.

- [ ] **Experiments Section**
Experiments listing and detail pages. Additional fields: status indicator, learning log, "what I'm figuring out". Same structure as Projects.

- [ ] **Admin: User Management**
View all users with status. Manual profile unlock. Bulk unlock by event. Profile moderation capabilities.

---

## Phase 3: Community Growth

- [ ] **Community Content Submission**
Members can submit projects/experiments. Approval queue for moderation.

- [ ] **Paid Courses**
Course data model. Gated access for members. Course listing and detail pages.

- [ ] **Membership Tiers**
Subscription billing via Stripe. Tier-based access control. Member dashboard.

- [ ] **Event Sponsorship Display**
Sponsor data model. Sponsor logos on event pages. Sponsor listing/acknowledgment.

---

## Phase 4: Platform Maturity

- [ ] **Event Cohort Spaces**
Private areas for event attendees. Post-event materials and discussion.

- [ ] **Direct Messaging**
Member-to-member messaging. Notification system.

- [ ] **Advanced Analytics**
Event performance dashboards. Content engagement metrics. Revenue reporting.

---

## Notes

- Features are ordered by dependency: complete earlier features before later ones
- Each feature should be a single PR that can be reviewed and merged independently
- Track progress in the main [README.md](../README.md) checklist

---

*Last Updated: 2026-01-16*
