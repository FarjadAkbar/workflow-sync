# Dolce CRM

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)](https://www.mongodb.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A CRM and task management tool for teams. Manage leads through a sales pipeline, run projects in sprints, track tasks and tickets, and keep conversations, files, and calendars in one workspace.

![Dolce CRM dashboard](public/readme.png)

## Demo

<video src="https://github.com/FarjadAkbar/worksync/raw/main/public/demo.webm" controls width="100%"></video>

If the player does not load, [watch the walkthrough](public/demo.webm). It is recorded with Playwright:

```bash
npx playwright test e2e/demo.spec.ts
```

## Features

- **Leads pipeline** - Track deals across New, Qualified, Proposal, Negotiation, and Won stages on a kanban board.
- **Dashboard** - Pipeline value, open leads, active sprints, and team activity at a glance.
- **Projects & sprints** - Plan work in sprints with progress tracking and per-project members.
- **Tasks** - Kanban and table views, subtasks, checklists, comments, and attachments.
- **Team** - Invite users and manage role-based access.
- **Tickets** - Support tickets with priority and status tracking.
- **Conversations** - Real-time team chat with file sharing.
- **Calendar** - Event scheduling with Google Calendar integration.
- **Files & notes** - Shared file storage and a notes database.

## Tech Stack

- **Framework**: Next.js 15 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Database**: MongoDB with Prisma ORM
- **Auth**: NextAuth.js
- **Realtime**: Socket.io
- **Data fetching**: TanStack Query
- **Forms**: React Hook Form + Zod
- **Testing**: Playwright (e2e), Jest

## Getting Started

### Prerequisites

- Node.js 18+
- A MongoDB database (Atlas or local)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/FarjadAkbar/worksync
cd worksync
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment**

Create a `.env` file in the project root:

```env
DATABASE_URL="mongodb+srv://user:password@cluster.mongodb.net/dolce"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
JWT_SECRET="your-secret-key"

# Optional integrations
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

4. **Set up the database**

```bash
npm run generate   # generate Prisma client
npm run migrate    # push schema to the database
npm run seed       # seed an admin user and sample data
```

5. **Start the dev server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run start` | Run the production build |
| `npm run lint` | Lint the codebase |
| `npm run test` | Run Jest unit tests |
| `npm run test:e2e` | Run Playwright end-to-end tests |
| `npm run migrate` | Push the Prisma schema to the database |
| `npm run seed` | Seed the database |

## Testing

End-to-end tests live in `e2e/` and run against a local dev server.

```bash
npm run dev          # in one terminal
npm run test:e2e     # in another
```

## License

MIT - see [LICENSE](LICENSE).
