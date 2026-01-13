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
