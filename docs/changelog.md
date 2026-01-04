# Changelog

All notable changes to COGS Calculator are documented here.

Format based on [Keep a Changelog](https://keepachangelog.com/).

---

## [Unreleased]

### Added
- (empty)

### Changed
- (empty)

### Fixed
- (empty)

---

## [v0.1.1] - 2026-01-04

### Changed
- **Ingredient defaults** — Inactive ingredients now default to grams (g) instead of cups for consistency with active ingredients
- **Help documentation** — Clarified that JSON format is not required for calculations; all math works directly in the UI
- Export dropdown now fully opaque with proper click handling
- StickyNotes use dark translucent glass aesthetic
- KPI status indicators moved from left to top border
- Config page updated to dark glass styling

### Fixed
- **COST/GRAM KPI** — Fixed KPI always showing $0.000 by passing `totalBatchWeight` prop to KPIGrid component
- Export dropdown click-through to underlying table rows

---

## [v0.1.0] - 2026-01-04

### Fixed
- **Inactive ingredient batch calculations** — `gramsInBatch` for inactive (base) ingredients was showing `0` in the Manufacturing Manifest. Now correctly calculates using `gramsPerRecipeUnit × baseUnitsInBatch`. (Fixes #3)

---

## [v1.0.0] - 2026-01-03

### Added
- Initial release
- COGS calculation engine
- Ingredients manifest with CSV/PDF export
- Batch scaling configuration
- Glass UI design system
- Recipe management
- KPI dashboard
