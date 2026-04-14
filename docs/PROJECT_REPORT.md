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

## Technology stack summary

- **Backend:** Java, Jakarta Servlets, JDBC.
- **Frontend:** JSP + CSS + JavaScript.
- **Database:** MySQL.
- **Packaging/deploy:** Maven WAR for Tomcat.
- **Runtime support:** Docker/Railway deployment option.
