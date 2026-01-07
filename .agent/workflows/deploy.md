---
description: Deploy COGS calculator to GitHub Pages
---

# Deploy Workflow

Production deployment - requires release tag first.

## Pre-Deploy Checklist

### 1. Ensure release is tagged
If not already tagged, run `/release` workflow first:
```bash
gh release list
```

### 2. Update Help Modal with Latest Features (if needed)
- Open `src/components/ui/HelpModal.tsx`
- Add any new features to the "How to Use" section
- Update "How Calculations Work" if formulas changed
- Update "Config Settings" if new config options added

### 3. Verify Build
// turbo
```bash
cd /Users/briandawson/workspace/db-utiliities/cogs-calculator
npm run build
```

### 4. Commit All Changes
```bash
git add -A
git commit -m "chore: prepare for production deploy"
git push origin main
```

// turbo
### 5. Deploy to GitHub Pages
```bash
cd /Users/briandawson/workspace/db-utiliities/cogs-calculator
npx gh-pages -d dist
```

### 6. Verify Deployment
- Wait 1-2 minutes for GitHub Pages to update
- Visit https://itsocialist.github.io/cogs-calculator/
- Test key features

### 7. Close related issues
```bash
gh issue close <issue-numbers>
```

## Rollback
If issues found, use `/release` rollback instructions.
