# nivo-fe

Nivo's Next.js frontend for hosting and VPS administration and customer experiences.

[![Codecov](https://codecov.io/gh/starci-lab/nivo-fe/graph/badge.svg)](https://app.codecov.io/gh/starci-lab/nivo-fe)

## Overview

This monorepo contains the Nivo admin and customer panel, an expert experience, and a public landing site. The apps share UI through `@nivo/ui`.

## Stack

- Next.js App Router, React, and TypeScript
- npm workspaces in `apps/` and `packages/`, with Turborepo for repository commands
- Tailwind CSS and the shared `@nivo/ui` package

## Repository layout

```text
apps/
  app/                  Admin and customer panel (@nivo/app)
  expert/               Expert experience (@nivo/expert)
  landing/              Public landing site (@nivo/landing)
  <app>/src/
    app/                Next.js route adapters
    features/           Page, layout, and overlay features
    components/         Blocks and reusable UI components
    hooks/              Domain hooks
    modules/            App capabilities and integrations
packages/ui/            Shared UI package
scripts/                Repository tooling
docs/                   Human documentation
e2e/                    Repository-level end-to-end tests
```

## Development

Run these from the repository root after `npm ci`:

```bash
npm run dev:app
npm run dev:expert
npm run dev:landing
npm run typecheck
npm run lint:check
npm run build
npm run test:unit
```

Each `dev:<app>` command starts one Next.js app. The quality commands run across the workspaces.

## Work note

The project's `.starciwork` tree lives in the sibling `nivo-backend` repository. This frontend consumes those product records and does not keep a second Work tree.
