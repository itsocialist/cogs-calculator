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

## Branch Sync Requirement ⚠️

**CRITICAL:** The `dev` and `staging` branches must stay in sync!

When pushing to staging, always sync to dev:
```bash
# After pushing to staging, sync dev:
git checkout dev
git merge staging --no-edit
git push origin dev
git checkout staging
```

Or as a one-liner:
```bash
git push origin staging && git checkout dev && git merge staging --no-edit && git push origin dev && git checkout staging
```

**Branch purpose:**
- `dev` - GitHub Pages dev environment (auto-deploys)
- `staging` - GitHub Pages staging environment (auto-deploys)
- `main` - Production (only merge after staging validation)
