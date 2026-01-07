---
description: Tag production deployments as GitHub releases with semantic versioning
---

# Release Workflow

Create GitHub releases with semantic version tags when deploying to production.

## Pre-Release Checklist

### 1. Verify all changes are tested on staging
- Check staging: https://itsocialist.github.io/cogs-calculator/staging/
- Confirm all features work as expected

### 2. Check if documentation needs updates
Run this to see what files changed since last release:
```bash
cd /Users/briandawson/workspace/db-utiliities/cogs-calculator
git log --name-only --oneline $(git describe --tags --abbrev=0)..HEAD
```

**Documentation triggers:**
| Changed Files | Doc to Update |
|--------------|---------------|
| `src/components/*` (new files) | Architecture |
| `src/context/configContext.tsx` | Configuration |
| `src/styles/theme.ts` | Configuration |
| Any significant feature | Changelog (auto) |

### 3. Determine version bump
- **MAJOR** (v2.0.0) - Breaking changes
- **MINOR** (v1.1.0) - New features, backwards compatible
- **PATCH** (v1.0.1) - Bug fixes only

## Create Release

### 4. Get current version
```bash
git describe --tags --abbrev=0 2>/dev/null || echo "No tags yet - starting at v1.0.0"
```

### 5. Create annotated tag
```bash
git tag -a v<VERSION> -m "Release v<VERSION>: <brief description>"
git push origin v<VERSION>
```

### 6. Create GitHub release with auto-generated notes
```bash
gh release create v<VERSION> --generate-notes --title "v<VERSION>" 
```

### 7. Deploy to production
Follow `/deploy` workflow to push to production.

## View Releases
```bash
gh release list
```

## Rollback (if needed)
```bash
# Check out previous version
git checkout v<PREVIOUS_VERSION>
npm run build
npx gh-pages -d dist
```
