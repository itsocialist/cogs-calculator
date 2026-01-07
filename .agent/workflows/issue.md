---
description: Create and manage GitHub Issues for tracking work
---

# Issue Workflow

Create and manage GitHub Issues to track features, bugs, and enhancements.

## Create a New Issue

### 1. Determine issue type and priority
- **bug** - Something isn't working
- **enhancement** - Improvement to existing feature
- **feature** - New functionality
- **documentation** - Docs updates needed

Priority labels: `P0` (critical), `P1` (high), `P2` (medium), `P3` (low)

### 2. Create issue via GitHub CLI
```bash
cd /Users/briandawson/workspace/db-utiliities/cogs-calculator
gh issue create --title "<title>" --body "<description>" --label "<type>,<priority>"
```

**Example:**
```bash
gh issue create --title "Add mouse-tracking spotlight to cards" --body "Add subtle gradient light that follows cursor on hover for Manifest totals and KPI cards" --label "enhancement,P1"
```

### 3. Link commits to issues
Use conventional commits with issue references:
```bash
git commit -m "feat(ui): add card spotlight effect

Fixes #<issue-number>"
```

## List Open Issues

```bash
gh issue list
```

## Close an Issue
```bash
gh issue close <issue-number>
```

## View Issue Details
```bash
gh issue view <issue-number>
```

## Commit Convention

Format: `<type>(<scope>): <description>`

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting, no code change
- `refactor` - Code restructuring
- `test` - Adding tests
- `chore` - Maintenance

**Example:**
```
feat(manifest): add PDF export option

Fixes #42
```
