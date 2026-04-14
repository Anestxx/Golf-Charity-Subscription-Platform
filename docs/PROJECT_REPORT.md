# Golf Charity Subscription Platform — Project Report

## 1) What is in the project (high-level)

This is a **Java web application** (Servlet + JSP + JDBC + MySQL) for a golf club/community that combines:

- membership onboarding and login,
- subscription renewal,
- event registration,
- tee-time booking,
- donation tracking and leaderboards,
- payment simulation/history,
- member directory and profile management.

The codebase contains:

- Backend Java classes in `src/main/java/com/golfcharity` (servlets, services, DAOs, models, config).
- JSP views in `src/main/webapp/WEB-INF/views`.
- Shared frontend assets in `src/main/webapp/assets`.
- SQL schema + seed data in `sql/`.

---

## 2) Abstract

The Golf Charity Subscription Platform is a full-stack, database-driven membership portal for golf communities and fundraising programs. It centralizes member lifecycle functions (registration, authentication, profile updates, subscription renewals), operational workflows (event seat booking and tee-time reservation with capacity constraints), and impact reporting (donor and team leaderboards). The system uses Java Servlets and JSP for presentation and request handling, JDBC-based DAOs for persistence, and MySQL business logic (including a donation trigger and subscription renewal procedure) for integrity and automation. The result is a unified platform that reduces administrative overhead, improves booking reliability, and increases transparency of fundraising progress.

---

## 3) Introduction

Golf clubs and charity-based sports communities often run multiple disconnected processes for membership, events, and fundraising. This project introduces a unified platform where members can:

- join the club,
- sign in securely,
- book events and tee slots,
- renew subscriptions,
- donate and monitor campaign momentum,
- maintain a discoverable member profile.

The system is designed as a traditional Java web app (WAR deployment model) with a clear separation between presentation (JSP), request orchestration (Servlets), and data access (DAO layer).

---

## 4) Existing systems

Typical existing alternatives in many clubs/charity communities are:

1. Spreadsheet + email workflows for registrations and payments.
2. Separate tools for membership, events, and fundraising dashboards.
3. Manual tee-sheet management by staff.
4. Basic websites that only show static announcements (no transactional flows).

These systems are usually fragmented and require heavy manual coordination.

---

## 5) Drawbacks in existing systems

Common drawbacks addressed by this project:

- **Data fragmentation:** member, payment, and fundraiser data spread across tools.
- **Overbooking risk:** manual seat counting and tee-slot assignment errors.
- **Low transparency:** limited real-time visibility into donor/team progress.
- **Poor member experience:** users jump between portals/channels.
- **Administrative burden:** repetitive manual validation and reconciliation.

---

## 6) Proposed system — features

### Core platform features

- **Authentication & registration:** account creation and session-based login.
- **Protected app area:** `AuthFilter` secures main member routes.
- **Dashboard analytics:** active members, upcoming events, tee openings, total raised.
- **Event registration:** seat-aware booking with duplicate prevention.
- **Tee-time booking:** capacity checks + one confirmed booking per member/day.
- **Donations:** contribution capture + donor and team leaderboards.
- **Payments:** simulate/store different payment types with reference codes.
- **Directory:** searchable member directory with privacy toggle.
- **Account management:** profile updates and one-click membership renewal.

### Database/business logic features

- Normalized relational schema with indexes for key query paths.
- Trigger to auto-roll donation amount into team totals.
- Stored procedure to create renewal subscriptions.

---

## 7) Advantages and uniqueness

### Advantages

- **Single platform** for operations + fundraising.
- **Constraint-aware transactions** reduce booking conflicts.
- **Visibility of impact** through live leaderboard-style views.
- **Academic-friendly architecture** (clear MVC-like layering with DAO/service separation).
- **Deployable standard WAR** approach compatible with Tomcat.

### Uniqueness

- Blends **golf operations** (events + tee sheets) with **charity momentum tracking** in one user journey.
- Uses DB-side automation (trigger/procedure) to reinforce business consistency.
- Supports both community networking (directory/team context) and monetization flows (subscriptions/payments/donations).

---

## 8) System architecture diagram

```mermaid
flowchart LR
    U[Member/Admin Browser] --> V[JSP Views]
    V --> S[Servlet Layer]
    S --> SV[Service Layer]
    S --> D[DAO Layer]
    SV --> D
    D --> DB[(MySQL Database)]

    subgraph Web App (Tomcat)
      V
      S
      SV
      D
    end

    DB --> T[Trigger: donation -> team total_raised]
    DB --> P[Stored Procedure: sp_renew_subscription]
```

### Component notes

- **Views:** JSP pages for each function area.
- **Servlets:** route handlers for home/auth/dashboard/events/tee-times/etc.
- **Services:** auth + membership orchestration.
- **DAOs:** SQL access abstraction per domain.
- **Database:** transactional data model + trigger/procedure business logic.

---

## Page-by-page explanation and usefulness

### Public/auth pages

1. **Home (`/`)**
   - Shows platform value proposition, headline metrics, featured events, and top donor spotlight.
   - Helpful because it communicates impact and directs users to register/login.

2. **Register (`/register`)**
   - New member form (name, email, password, city, optional team).
   - Helpful because onboarding is self-service and immediately creates a usable member profile.

3. **Login (`/login`)**
   - Session login form for existing members.
   - Helpful because it protects member operations behind authentication.

### Authenticated app pages

4. **Dashboard (`/dashboard`)**
   - Overview cards (members/events/open tee spots/raised amount), subscription status, upcoming events/slots, top donors.
   - Helpful because users get a single control center view instead of checking multiple modules.

5. **Events (`/events`)**
   - Lists upcoming events and allows seat reservation if available and not already registered.
   - Helpful because booking is instant and seat count reliability is enforced by backend logic.

6. **Tee Times (`/tee-times`)**
   - Lists available slots with open spots and booking action.
   - Helpful because it prevents conflicts (full slots, duplicate same-slot booking, one booking/day rule).

7. **Donations (`/donations`)**
   - Donation form + donor leaderboard + team leaderboard + total raised.
   - Helpful because it encourages giving and keeps campaign progress transparent.

8. **Directory (`/directory`)**
   - Searchable list of visible member profiles (city, team, handicap, bio).
   - Helpful because it supports community discovery, networking, and team building.

9. **Account (`/account`)**
   - Subscription status/renewal and editable profile preferences (including directory visibility).
   - Helpful because members can self-manage account data and renewal lifecycle.

10. **Payments (`/payments`)**
   - Payment simulation form and transaction history table with reference/status.
   - Helpful because staff/member-side records remain centralized and auditable.

11. **Logout (`/logout`)**
   - Ends session and redirects to login.
   - Helpful because it secures shared-device usage.

---

## Detailed page-by-page deep dive (purpose, processing, and value)

This section expands each page with three lenses:

- **What the page does (UI purpose)**
- **How it works internally (server + data interaction)**
- **Why it is helpful (business/member outcome)**

### 1) Home page (`/`)

**What it does**
- Presents the brand message, key metrics, featured upcoming events, and a donor spotlight.
- Provides clear entry points to register or log in.

**How it works**
- `HomeServlet` collects:
  - featured events (`EventDao`),
  - top donors (`DonationDao`),
  - stats (`DashboardDao`).
- If DB data is temporarily unavailable, it renders fallback content and a warning banner.

**Why it is helpful**
- Converts visitors to members by showing both participation value (events) and social impact (donor visibility).
- Keeps the landing page resilient even if data services are briefly unavailable.

### 2) Register page (`/register`)

**What it does**
- Captures new member data: full name, email, password, city, optional team/foursome.

**How it works**
- `RegisterServlet` accepts form input, calls `AuthService.register`, creates session identity, and redirects to dashboard on success.
- On validation failure, it returns the same page with preserved form values and error messaging.

**Why it is helpful**
- Reduces administrative onboarding work by enabling self-registration.
- Creates an immediately usable account session, so the user can proceed without extra waiting.

### 3) Login page (`/login`)

**What it does**
- Allows existing members to sign in.

**How it works**
- `LoginServlet` validates credentials through `AuthService.authenticate`.
- On success, session attributes (`userId`, name, role) are set and member is redirected to `/dashboard`.

**Why it is helpful**
- Protects sensitive/transactional pages and personal records.
- Supports personalized UI context (viewer name, role, flash messages).

### 4) Dashboard page (`/dashboard`)

**What it does**
- Serves as a command center with membership stats, upcoming events, tee slots, top donors, and subscription snapshot.

**How it works**
- `DashboardServlet` aggregates data from several DAOs in one request:
  - `DashboardDao` stats,
  - `EventDao` event list,
  - `TeeTimeDao` upcoming slots,
  - `DonationDao` top donors,
  - `SubscriptionDao` current plan.

**Why it is helpful**
- Removes the need for members/admins to navigate multiple screens for routine awareness.
- Encourages engagement by putting “next actions” and progress indicators in one place.

### 5) Events page (`/events`)

**What it does**
- Displays available upcoming events and allows seat reservation.

**How it works**
- `EventsServlet` loads event inventory and member’s already-registered event IDs.
- On booking attempt, backend enforces:
  - no duplicate registration,
  - capacity constraints.
- UI disables buttons for sold-out/already-registered states.

**Why it is helpful**
- Maintains reliable seat accounting for fundraising rounds and club events.
- Prevents front-desk reconciliation issues caused by manual overbooking.

### 6) Tee Times page (`/tee-times`)

**What it does**
- Lists available golf slots and allows reservation.

**How it works**
- `TeeTimeServlet` loads upcoming slots plus user’s booked slot IDs.
- Booking logic enforces:
  - slot capacity,
  - no duplicate slot booking,
  - one confirmed booking per user per day.
- UI states clearly show unavailable/full/already-booked conditions.

**Why it is helpful**
- Delivers fair slot access and avoids schedule collisions.
- Reduces course operations overhead by enforcing policy in system logic.

### 7) Donations page (`/donations`)

**What it does**
- Lets members submit donations and view donor/team leaderboards with total raised.

**How it works**
- `DonationsServlet`:
  - reads donor leaderboard + team leaderboard + cumulative amount,
  - validates submitted amount,
  - stores donation with reference code.
- Database trigger updates `teams.total_raised` after each donation insert.

**Why it is helpful**
- Creates a visible feedback loop for fundraising momentum.
- Recognizes top contributors and teams, which increases campaign participation.

### 8) Directory page (`/directory`)

**What it does**
- Provides a searchable member network view (name/city/team/handicap/bio).

**How it works**
- `DirectoryServlet` accepts optional query `q` and calls `UserDao.searchDirectory`.
- Directory visibility preference is respected via profile settings.

**Why it is helpful**
- Strengthens community networking and team formation.
- Balances discoverability with member privacy controls.

### 9) Account page (`/account`)

**What it does**
- Displays subscription status and offers profile editing + renewal action.

**How it works**
- `AccountServlet` handles two post actions:
  - `renew`: executes membership renewal flow via `MembershipService`,
  - `profile`: updates team/city/handicap/bio/directory visibility.
- Team assignment supports find-or-create behavior via `TeamDao`.

**Why it is helpful**
- Enables self-service profile quality and subscription continuity.
- Keeps directory data current and reduces support requests.

### 10) Payments page (`/payments`)

**What it does**
- Simulates operational payments (e.g., sponsorship/event fee/merch) and shows history.

**How it works**
- `PaymentsServlet` validates amount/type, stores record with generated reference code, and lists user payment history.
- Useful for demo/academic flows where full gateway integration is out of scope.

**Why it is helpful**
- Preserves transaction traceability and status history in one place.
- Demonstrates extensible transaction handling for future real payment gateway integration.

### 11) Logout page (`/logout`)

**What it does**
- Ends session and redirects to login with a flash message.

**How it works**
- `LogoutServlet` invalidates active session and clears authenticated state.

**Why it is helpful**
- Important for shared devices and role/session safety.

---

## End-to-end user journey (simple)

1. Visitor lands on `/` and sees impact + opportunities.
2. User signs up via `/register` (or uses `/login`).
3. Authenticated flow opens at `/dashboard`.
4. User can then:
   - reserve events (`/events`),
   - reserve rounds (`/tee-times`),
   - donate (`/donations`),
   - maintain profile/subscription (`/account`),
   - track transaction logs (`/payments`),
   - network (`/directory`).
5. User logs out safely through `/logout`.

This journey demonstrates the project’s central value: **one integrated place for club operations + fundraising impact**.

---

## Technology stack summary

- **Backend:** Java, Jakarta Servlets, JDBC.
- **Frontend:** JSP + CSS + JavaScript.
- **Database:** MySQL.
- **Packaging/deploy:** Maven WAR for Tomcat.
- **Runtime support:** Docker/Railway deployment option.
