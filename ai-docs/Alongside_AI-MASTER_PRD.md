# Product Requirements Document: Alongside AI

**Website:** alongs.ai  
**Version:** 1.0  
**Date:** January 2026

---

*A community-driven ecosystem where the tech professional evolves into the sovereign creator.*

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Vision & Mission](#2-product-vision--mission)
3. [Target Audience](#3-target-audience)
4. [Core Features](#4-core-features)
5. [User Flows](#5-user-flows)
6. [Information Architecture](#6-information-architecture)
7. [Design System](#7-design-system)
8. [Technical Requirements](#8-technical-requirements)
9. [Admin & Content Management](#9-admin--content-management)
10. [Revenue Model](#10-revenue-model)
11. [Phasing & Roadmap](#11-phasing--roadmap)
12. [Success Metrics](#12-success-metrics)
13. [Open Questions](#13-open-questions)

---

## 1. Executive Summary

Alongside AI (alongs.ai) is a platform for technical builders who want to work with AI to create meaningful, purpose-driven work. The site serves as both a promotional hub for paid educational events and a growing community space where attendees can connect, showcase their work, and continue learning together.

The platform is founded by David and Nathan, combining decades of teaching and development experience with a vision of helping tech professionals evolve into sovereign creators—people who build joyful, autonomous, and spiritually aligned work alongside AI as a reflective partner.

### Key Objectives

- Promote and sell educational events (mini-conferences, workshops, meetups)
- Showcase founder expertise through projects, experiments, and content
- Build community around event attendees with gated profile features
- Provide free educational content to attract and nurture potential attendees
- Grow email list for ongoing engagement and event promotion

---

## 2. Product Vision & Mission

### Vision Statement

Alongside AI is a community-driven ecosystem where the tech professional evolves into the sovereign creator. By working alongside one another—and alongside AI as a reflective partner—we move beyond mere employment to creating life's work that is joyful, autonomous, and spiritually aligned.

### Mission

To provide transformative educational experiences and a supportive community for technical builders who are ready to integrate AI into their creative and professional practice with intention and heart.

### Core Values

- **Sovereignty:** Empowering individuals to own their creative and professional path
- **Alongside:** Learning together, building together, growing together
- **Heart-Centered:** Technical rigor infused with purpose and meaning
- **Working in Public:** Transparent sharing of process, experiments, and learnings

---

## 3. Target Audience

### Primary Audience

Technical builders working with AI who want to understand or create their heart's vision in the world. This includes software developers, data engineers, database professionals, and technical creators who are looking to level up their AI capabilities while finding more meaning in their work.

### Audience Characteristics

- Existing technical background (software development, data, databases)
- Curious about AI but may feel overwhelmed by the pace of change
- Seeking practical, hands-on learning rather than theoretical content
- Open to philosophical and intentional approaches to technology
- Looking for community and connection with like-minded builders
- Willing to invest in quality educational experiences

---

## 4. Core Features

### 4.1 Events System

Events are the primary revenue driver and community catalyst. The system supports both virtual and in-person events at intimate scale (8-20 attendees).

#### Event Types

- **Mini-Conferences:** Multi-session events spanning 1-2 days
- **Workshops:** Intensive, hands-on sessions focused on specific skills
- **Meetups:** Shorter community gatherings for networking and discussion

#### Event Page Elements

- Event title, date(s), time, and timezone
- Location (physical address or "Virtual" with platform details)
- Rich description with formatting support
- Agenda/schedule (for multi-session events)
- Speaker/facilitator profiles (linked to founder profiles)
- Public price display
- Discount code input field
- "Register Now" call-to-action button
- Related content (linked projects, articles, videos)
- Tags/categories for discoverability
- Embedded LinkedIn posts (manually curated)

#### Event Listing Page

- Filterable by event type, date range, format (virtual/in-person)
- Featured/upcoming events highlighted
- Past events archive (without registration, with recap content)

### 4.2 Registration & Payments

#### Registration Flow

1. User clicks "Register Now" on event page
2. Guest checkout available (no account required upfront)
3. Collects: name, email, optional discount code
4. Stripe Checkout handles payment
5. Account automatically created using provided email
6. Confirmation page with next steps

#### Post-Purchase Experience

- Email confirmation with event details
- Calendar invite (ICS file or Google Calendar link)
- Access to pre-event materials (if applicable)
- Account credentials for site login
- Note: Attendee list hidden to avoid empty room perception

#### Discount Code System

- Percentage or fixed amount discounts
- Codes can reduce price to $0 (free attendance while retaining value perception)
- Usage limits (per code, per user)
- Expiration dates

### 4.3 Projects & Experiments (The Lab)

A showcase space for work—initially founder content, eventually open to community members. Curated and polished in presentation, but embracing a "working in public" philosophy.

#### Projects (Shipped Work)

Completed, polished work that demonstrates expertise and capability.

- Title, description, hero image/video
- Case study narrative (problem, approach, outcome)
- Links to live demos, repositories, external resources
- Attached videos (YouTube embeds)
- Related events and articles
- Tags/categories
- Author attribution (linked to profile)

#### Experiments (In-Progress Explorations)

Work in progress—explorations, prototypes, learning exercises shared transparently.

- Same fields as Projects, plus:
  - Status indicator (exploring, prototyping, paused, concluded)
  - Learning log / update feed
  - "What I'm trying to figure out" section

### 4.4 Learn Section

Home for educational content—free resources that attract potential event attendees and demonstrate teaching quality.

#### Content Types

- **Video Tutorials:** YouTube embeds organized into playlists/series
- **Free Resources:** Downloadable guides, cheatsheets, templates
- **Courses (Future):** Gated, structured learning paths with member access

#### Organization

- Browsable by topic tags
- Linked to relevant projects and events
- Featured content on section landing page

### 4.5 Blog / Articles

Written content mirrored from Substack, which serves as the source of truth. Supports multiple writers (founders initially, potentially community contributors later).

#### Implementation

- Content pulled/synced from Substack
- Full articles displayed on site (not just teasers)
- Author attribution with profile link
- Tags/categories consistent with site taxonomy
- Related content (projects, events, videos)
- Link back to Substack for comments/discussion

### 4.6 Community & Member Profiles

Lightweight community features gated behind event attendance to solve the "empty room" problem. Profiles unlock post-event through manual admin action.

#### Profile Fields (All Optional)

- Display name
- Profile photo
- Bio / about text
- Social links (LinkedIn, Twitter/X, GitHub, personal site, etc.)
- "What I'm working on now"
- Skills / interests
- Location
- Events attended (auto-populated)
- Projects/experiments (if feature extended to community)

#### Profile Visibility States

- **Locked:** Default for new accounts; profile exists but cannot be edited or viewed publicly
- **Unlocked:** Admin-enabled after event attendance; can edit and optionally publish
- **Published:** Visible in community directory (user opt-in)

#### Founder Profiles

David and Nathan use the same profile structure as community members, but with richer content. Their profiles serve as the model for what community profiles can become.

#### Community Directory (Future)

- Visible only to unlocked members
- Searchable by skills, location, interests
- Displays only published profiles
- Note: Defer until critical mass of attendees exists

### 4.7 Newsletter & Email Capture

Email collection woven throughout the site for ongoing engagement. Subscribers receive both content updates and event announcements.

#### Signup Placements

- Homepage hero or below-fold section
- Footer (persistent across all pages)
- End of articles
- Learn section
- Dedicated newsletter page (optional)

#### Email Types

- Content digest (new articles, videos, projects)
- Event announcements
- Note: Single list for now (both content types); may segment later

### 4.8 Search & Discovery

#### Site-Wide Search

- Searches across: events, projects, experiments, articles, videos
- Results grouped by content type
- Search box in header/navigation

#### Tag System

- Unified taxonomy across all content types
- Example tags: LangChain, PostgreSQL, Agents, RAG, Data Engineering
- Tag pages showing all content with that tag
- Clickable tags on content items for cross-discovery

### 4.9 Social Proof & Testimonials

- Testimonial cards featuring quotes from past attendees/students
- Attribution: name, role/company (with permission), photo (optional)
- Placement: homepage, event pages, about page
- Linkable to specific events when relevant

---

## 5. User Flows

### 5.1 New Visitor to Event Attendee

1. Discovers site via social media, search, or referral
2. Explores homepage—sees upcoming events, featured projects, founder credibility
3. Browses free content (articles, videos) to assess quality
4. Signs up for newsletter (optional)
5. Clicks into an event that matches their interests
6. Reviews event details, speaker bios, related content
7. Clicks "Register Now"
8. Completes guest checkout (email, payment via Stripe)
9. Receives confirmation email with calendar invite and login details
10. Attends event

### 5.2 Event Attendee to Community Member

1. After event, admin manually unlocks attendee profiles
2. Attendee receives email: "Your profile is ready to set up"
3. Logs in and completes profile (photo, bio, links, etc.)
4. Chooses to publish profile to community directory (opt-in)
5. Can now browse other published profiles and connect

### 5.3 Newsletter Subscriber Journey

1. Signs up via homepage, article footer, or dedicated page
2. Receives welcome email
3. Gets periodic content digests and event announcements
4. Clicks through to site to read articles or learn about events
5. Eventually converts to event attendee

---

## 6. Information Architecture

### 6.1 Site Map

**Primary Navigation:**

- Home
- Events (listing → individual event pages)
- Lab (Projects + Experiments → individual detail pages)
- Learn (Videos, Resources → individual items)
- Blog (article listing → individual articles)
- About (mission, founders, community story)

**Secondary/Utility Navigation:**

- Search
- Login / Account
- Community (gated—visible after unlock)
- Newsletter signup

**Footer Navigation:**

- Contact
- Privacy Policy
- Terms of Service
- FAQ
- Social links (LinkedIn, Substack, Slack)

### 6.2 Homepage Sections

1. **Hero:** Tagline, value proposition, primary CTA (view events or newsletter signup)
2. **Upcoming Events:** Featured upcoming events with quick details
3. **Featured Content:** Selected projects, videos, or articles
4. **About/Founders:** Brief intro to David and Nathan with credibility markers
5. **Testimonials:** Social proof from past attendees
6. **Newsletter CTA:** Final conversion opportunity

---

## 7. Design System

### 7.1 Design Philosophy: "High-Tech Humanist"

The visual design bridges two worlds: the precision and power of technology with the warmth and connection of human community. The site should feel technically credible to developers while also feeling welcoming and purpose-driven.

### 7.2 Visual Language

#### Code/Technical Areas

- Dark mode terminal aesthetics
- Monospace fonts for code snippets
- Subtle syntax highlighting colors
- Sharp, precise typography

#### Community/Human Areas

- Warm, organic layouts
- Rounded corners on cards and buttons
- Generous whitespace
- Friendly, readable body typography
- Photography that shows real people and authentic moments

#### Interaction Design

- Clear, prominent call-to-action buttons
- Intuitive navigation with minimal clicks to key actions
- Smooth transitions and micro-interactions
- Mobile-first responsive design

### 7.3 Color Palette (Suggested)

Final palette to be determined in design phase, but general direction:

- **Primary:** Deep, sophisticated dark (not pure black)
- **Accent:** Warm, energetic highlight color for CTAs
- **Secondary:** Muted tones for supporting elements
- **Text:** High contrast for readability, softer for secondary content

---

## 8. Technical Requirements

### 8.1 Integrations

| System | Purpose |
|--------|---------|
| Stripe Checkout | Payment processing for event registration |
| Substack | Source of truth for blog content; sync to site |
| YouTube | Video embed hosting |
| LinkedIn | Manual post embeds on relevant pages |
| Email Service (TBD) | Newsletter management and transactional emails |
| Slack (Future) | External community space, linked from site |
| Calendar (ICS/Google) | Event invites sent post-purchase |

### 8.2 Functional Requirements

- **Authentication:** Email/password login; account auto-created at purchase
- **Authorization:** Role-based access (admin, unlocked member, locked member, guest)
- **Search:** Full-text search across all public content
- **CMS:** Ability for admins to create/edit events, projects, experiments, videos
- **Responsive:** Full functionality on mobile, tablet, desktop

### 8.3 Performance & Security

- Fast page loads (target <3s initial load)
- HTTPS everywhere
- Secure handling of payment data (via Stripe—no card data on our servers)
- GDPR-compliant email consent
- Regular backups of content and user data

---

## 9. Admin & Content Management

### 9.1 Admin Capabilities

#### Event Management

- Create, edit, duplicate, archive events
- Set pricing and create discount codes
- View attendee list and registration details
- Send communications to event registrants
- Add pre-event and post-event materials

#### Content Management

- Create, edit, delete projects and experiments
- Add videos to Learn section
- Manage tag taxonomy
- Feature/unfeature content on homepage
- Embed LinkedIn posts on relevant pages

#### User Management

- View all users and their status (locked/unlocked/published)
- Manually unlock profiles for event attendees
- Bulk unlock for event cohorts
- Moderate published profiles if needed

#### Testimonials

- Add, edit, delete testimonials
- Assign testimonials to specific events or pages

### 9.2 Content Moderation (Future)

As community members gain ability to post projects/experiments, moderation tools will be needed: approval queues, flagging, removal capability.

---

## 10. Revenue Model

### 10.1 Current Revenue Stream

**Paid Events:** Mini-conferences, workshops, and meetups are the primary income source. Pricing varies by event type, duration, and format.

### 10.2 Future Revenue Streams

| Stream | Description | Timeline |
|--------|-------------|----------|
| Paid Courses | Structured, self-paced learning programs with gated access | Phase 2 |
| Membership Tiers | Recurring subscription for premium content, community access, discounts | Phase 3 |
| Sponsorships | Event sponsors and content partners | Phase 2-3 |

---

## 11. Phasing & Roadmap

### Phase 1: MVP Launch

**Goal:** Promotional site with event registration capability

- Homepage with hero, events, featured content, testimonials
- Event listing and detail pages
- Stripe Checkout integration
- Guest checkout with auto account creation
- Discount code system
- Founder profile pages (About section)
- Projects showcase (founder content)
- Blog with Substack integration
- Learn section with YouTube embeds
- Newsletter signup
- Site-wide search and tag system
- Standard pages (contact, privacy, terms, FAQ)
- Admin: event management, content editing, discount codes

### Phase 2: Community Foundation

**Goal:** Enable attendee profiles and begin community building

- Member profiles with edit capability
- Profile unlock workflow (admin-triggered)
- Community directory (visible to unlocked members)
- Experiments section (in-progress work)
- Slack integration (link out)
- Event sponsorship display

### Phase 3: Community Growth

**Goal:** Expand community capabilities and revenue streams

- Community members can post projects/experiments
- Paid courses with member access
- Membership tiers
- Enhanced profile features (badges, activity feed)
- Content moderation tools

### Phase 4: Platform Maturity

**Goal:** Full ecosystem with diverse content and strong community

- Event cohort spaces (private areas for attendees)
- Direct messaging between members
- Community-contributed courses
- Advanced analytics and reporting
- API for integrations

---

## 12. Success Metrics

### 12.1 Business Metrics

- Event registrations and revenue
- Newsletter subscriber count and growth rate
- Email-to-registration conversion rate
- Repeat attendee rate
- Revenue per event

### 12.2 Engagement Metrics

- Site traffic and sources
- Time on site and pages per session
- Content engagement (video views, article reads)
- Profile completion rate (unlocked members)
- Community directory opt-in rate

### 12.3 Quality Metrics

- Event NPS / satisfaction scores
- Testimonial collection rate
- Referral rate (attendees who refer others)

---

## 13. Open Questions

The following items require decisions during implementation:

1. **Email Infrastructure:** Which tool will manage newsletters and transactional emails? Options include feeding directly into Substack, using a dedicated tool like ConvertKit/Mailchimp, or a hybrid approach.

2. **Substack Sync Method:** Manual copy/paste, RSS feed pull, or API integration for blog content?

3. **Tagline:** The vision statement is strong, but a punchy tagline for the hero may need wordsmithing. Candidates: "Work alongside AI. Build what matters." or "From tech professional to sovereign creator."

4. **Community Directory Trigger:** At what attendee count should the community directory become visible? 10? 25? 50?

5. **Pre-Event Materials Hosting:** Where do downloadable resources live? On-site storage, Google Drive links, or integrated file hosting?

6. **Virtual Event Platform:** For virtual events, what platform will be used? (Zoom, Google Meet, custom solution?) This affects what details appear on event pages.

---

*— End of Document —*
