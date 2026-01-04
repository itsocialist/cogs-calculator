---
description: Testing and deployment order - dev first, then staging, then production
---

# Testing & Deployment Workflow

Always follow this order when testing and deploying changes:

## 1. DEV (Local Development)
- **URL**: `http://localhost:5173` (or whichever port Vite assigns)
- **Purpose**: First testing environment, immediate feedback
- **When to use**: Always start here for any code changes

## 2. STAGING  
- **URL**: `https://itsocialist.github.io/cogs-calculator/staging/`
- **Purpose**: Pre-production verification, mirrors production environment
- **When to use**: After dev testing passes, deploy to staging using `/stage` workflow

## 3. PRODUCTION
- **URL**: `https://itsocialist.github.io/cogs-calculator/`
- **Purpose**: Live user-facing environment
- **When to use**: Only after staging verification passes, deploy using `/deploy` workflow

## Important Notes
- **Never skip dev testing** - Always verify changes locally first
- **Never deploy directly to production** - Always go through staging
- The dev server is started with `npm run dev`
