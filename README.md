# Good Drive Club

A deployable Next.js implementation of the golf charity subscription platform from the PRD, with:

- public marketing homepage
- real SQLite-backed persistence
- subscriber signup and login
- rolling 5-score Stableford tracking
- charity allocation updates
- draw simulation and publishing
- winner proof submission and payout review
- admin analytics and charity management

## Local run

```powershell
npm install
npm run dev
```

Open `http://localhost:3000`.

## Demo accounts

- Subscriber: `maya@example.com` / `demo123`
- Admin: `admin@example.com` / `admin123`

## Stack

- Next.js App Router
- Node built-in SQLite database at `data/good-drive.db`
- Server Actions for writes
- Cookie-based sessions

## Deployment note

This app is ready for Node-based deployment targets that support filesystem-backed SQLite persistence, such as Railway, Render, or a VM/container deployment. For serverless deployment, the data layer should be swapped to a managed database.
