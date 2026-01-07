---
description: Keep version numbers synchronized across package.json, help modal, and snapshots
---

# Version Sync Workflow

Use this workflow when bumping version numbers to ensure all locations are updated consistently.

## Version Locations

The version number appears in these files:
1. `package.json` - Main version source of truth
2. `src/hooks/useCalculator.ts` - Line 428 (snapshot version metadata)
3. `src/components/ui/HelpModal.tsx` - Line 225 (Updates section title)
4. `docs/changelog.md` - Version headers

## Steps to Update Version

1. **Decide on new version number** using semantic versioning:
   - MAJOR.MINOR.PATCH (e.g., 0.1.1, 0.2.0, 1.0.0)
   - PATCH: Bug fixes
   - MINOR: New features (backward compatible)
   - MAJOR: Breaking changes

2. **Update package.json**:
   ```bash
   # Edit the version field
   vim package.json
   ```

3. **Update useCalculator.ts**:
   ```typescript
   // Line ~428 in src/hooks/useCalculator.ts
   version: '0.1.1',  // Update this
   ```

4. **Update HelpModal.tsx**:
   ```typescript
   // Line ~225 in src/components/ui/HelpModal.tsx
   title="Updates (v0.1.1)"  // Update this
   ```

5. **Update changelog.md**:
   - Move items from `[Unreleased]` to new version section
   - Add date in format: `## [v0.1.1] - YYYY-MM-DD`
   - Create new empty `[Unreleased]` section

6. **Verify all locations**:
   ```bash
   # Search for old version number
   grep -r "0.1.0" src/ docs/ package.json
   ```

## Example Changelog Update

```markdown
## [Unreleased]

### Added
- (empty for now)

---

## [v0.1.1] - 2026-01-04

### Changed
- Ingredient defaults to grams
- Help documentation clarified

---

## [v0.1.0] - 2026-01-04
...
```

## Checklist

- [ ] Updated `package.json`
- [ ] Updated `src/hooks/useCalculator.ts` (line ~428)
- [ ] Updated `src/components/ui/HelpModal.tsx` (line ~225)
- [ ] Updated `docs/changelog.md` with new version section
- [ ] Verified no old version numbers remain with grep
- [ ] Committed changes with message: "chore: bump version to vX.X.X"
