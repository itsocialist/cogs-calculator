---
description: Update GitHub Wiki documentation and changelog
---

# Documentation Workflow

Manage project documentation in the `/docs` folder and generate changelogs.

## Documentation Structure

```
docs/
├── README.md           # Overview and quick links
├── getting-started.md  # Setup and development
├── architecture.md     # System design, components
├── configuration.md    # Config options
└── changelog.md        # Version history
```

## Update Documentation

### 1. Architecture docs
Update when adding new components or major refactors:
```bash
# Edit the architecture doc
code /Users/briandawson/workspace/db-utiliities/cogs-calculator/docs/architecture.md
```

Include:
- Component diagram (mermaid)
- File structure
- Data flow
- Key design decisions

### 2. Configuration docs
Update when changing config options in `configContext.tsx` or `theme.ts`:
```bash
code /Users/briandawson/workspace/db-utiliities/cogs-calculator/docs/configuration.md
```

### 3. Changelog
Auto-generate from commits, then review/edit:
```bash
cd /Users/briandawson/workspace/db-utiliities/cogs-calculator

# Get commits since last tag
git log --oneline $(git describe --tags --abbrev=0 2>/dev/null || echo "")..HEAD
```

Format for changelog.md:
```markdown
## [v1.1.0] - 2026-01-03

### Added
- Mouse-tracking spotlight effect on cards (#12)

### Changed
- Export dropdown now fully opaque (#11)

### Fixed
- Click-through issue on export menu (#10)
```

## Commit Documentation Changes
```bash
git add docs/
git commit -m "docs: update <section> for v<VERSION>"
```

## Documentation Maintenance Rules

| Doc Page | When to Update |
|----------|----------------|
| Architecture | New components, major refactors |
| Configuration | Changes to configContext.tsx, theme.ts |
| Changelog | Every release (auto-generate from commits) |
| Getting Started | Setup process changes |
