# Park-App

Parking reservation system monorepo.

## Quick Start

```bash
# Install dependencies
npm install

# Start all development servers
npm run dev

# Build all packages
npm run build

# Type-check all packages
npm run check-types

# Lint all packages
npm run lint

# Format code
npm run format
```

## Project Structure

```
park-app/
├── apps/
│   ├── web/     # React frontend
│   └── api/     # Hono backend
└── packages/
    ├── shared/           # Shared types & schemas
    ├── typescript-config/  # TypeScript configs
    └── eslint-config/     # ESLint config
```

## Tech Stack

- **Frontend**: React + Vite + TanStack Query + TanStack Router
- **Backend**: Hono + Node.js
- **Shared**: TypeScript + Zod validation
- **Build**: Turborepo + npm workspaces

## Workflows (ASCII)

Driver flow
```
[Open App]
    |
    v
[Sign up / Login]
    |
    v
[Map Search] -> [Parking Detail]
    |
    v
[Reserve (date/time/vehicle)]
    |
    v
[Payment (mock checkout)]
    |
    v
[Confirmation (QR code)]
    |
    v
[Reservations] -> [Optional Cancel]
```

Partner flow
```
[Sign up / Login]
    |
    v
[Partner Onboard]
    |
    v
[Add Parking Location]
    |
    v
[Update Availability]
    |
    v
[Set Tariffs]
    |
    v
[Monitor Reservations] -> [Check-in]
    |
    v
[KPIs]
```

Ops flow (imports)
```
[Imports]
    |
    v
[Upload CSV]
    |
    v
[Track Status / Results]
```
