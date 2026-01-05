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

## [v0.1.2] - 2026-01-04

### Added
- **Cost Per Unit display (#18)** — Added `$/Unit` column to Ingredients Manifest showing cost per base recipe unit for each ingredient
- CSV and PDF exports now include cost-per-unit calculations

### Fixed
- **Potency calculation bug (#17)** — KPI Grid and Accounting Tape now correctly display potency per base recipe unit instead of SKU potency
  - Example: 1oz base unit with 500mg target now shows ~500mg instead of incorrectly showing 2oz SKU potency (1053mg)
  - Fixed both KPIGrid component and DraggableMathPanel (ticker)

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
