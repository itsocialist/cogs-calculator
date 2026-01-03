---
description: Deploy COGS calculator to GitHub Pages
---

# Deploy Workflow

Before deploying, complete this checklist:

## Pre-Deploy Checklist

### 1. Update Help Modal with Latest Features
- Open `src/components/ui/HelpModal.tsx`
- Add any new features to the "How to Use" section
- Update "How Calculations Work" if formulas changed
- Update "Config Settings" if new config options added
- Update "Tips & Best Practices" if relevant

### 2. Update Version (if significant changes)
- Consider adding version display in footer or help modal
- Document breaking changes in help

### 3. Verify Build
```bash
cd /Users/briandawson/workspace/db-utiliities/cogs-calculator
npm run build
```

### 4. Commit All Changes
```bash
git add -A
git commit -m "feat: <describe changes>"
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
- Test key features after login
