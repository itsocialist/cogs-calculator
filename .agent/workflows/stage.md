---
description: Deploy changes to staging environment
---

# Stage Workflow

Deploy your changes to the staging environment for testing.

## Pre-Stage Checklist

### 1. Ensure changes are linked to an issue
If working on a tracked item, reference the issue in commits:
```bash
git commit -m "feat(scope): description

Refs #<issue-number>"
```

## Quick Deploy (Recommended)

// turbo-all

### 2. Build locally to verify no errors
```bash
cd /Users/briandawson/workspace/db-utiliities/cogs-calculator
npm run build
```

### 3. Commit changes with issue reference
```bash
git add -A
git commit -m "feat: <describe changes>

Refs #<issue-number>"
```

### 4. Push to staging branch (triggers GitHub Action)
```bash
git push origin staging
```

The GitHub Action at `.github/workflows/deploy-staging.yml` will automatically:
- Install dependencies
- Build with staging base URL (`/cogs-calculator/staging/`)
- Deploy to `gh-pages` branch in the `staging` folder

## Staging URL
https://itsocialist.github.io/cogs-calculator/staging/

## Monitor Deployment
Check GitHub Actions: https://github.com/itsocialist/cogs-calculator/actions

## After Staging Approval
When staging is approved, proceed with `/release` to tag and deploy to production.
