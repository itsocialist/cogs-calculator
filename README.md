# COGS Calculator

A comprehensive Cost of Goods Sold (COGS) calculator for cannabis product manufacturing. Built with React, TypeScript, and Vite.

**Live Demo**: [https://itsocialist.github.io/cogs-calculator/](https://itsocialist.github.io/cogs-calculator/)

## Features

- 📊 **Recipe Management** — Define base units, ingredients (active cannabinoids & inactive base ingredients)
- 🧪 **Potency Calculations** — Calculate mg/g concentration and per-SKU potency
- 💰 **Cost Analysis** — Track ingredient costs, labor, packaging, and margins
- 📦 **SKU Configuration** — Define multiple product sizes with unit-level cost breakdowns
- 🏭 **Manufacturing Manifest** — Generate batch-scaled ingredient quantities
- 💾 **Snapshots** — Save and compare different formulations
- 📤 **Export** — Download data as CSV, JSON, or PDF

## Quick Start

```bash
# Clone the repository
git clone https://github.com/itsocialist/cogs-calculator.git
cd cogs-calculator

# Install dependencies
npm install

# Run development server
npm run dev
```

## Current Version

**v0.1.5** (January 2026)

### Recent Updates

- 🛠️ **Tools Menu**: Refactored Tools menu for better accessibility. "Math" and "Notes" are now integrated into the Tools dropdown.
- 🪟 **Non-Blocking Modals**: Calculator, Unit Converter, and Dosage Calculator are now draggable, non-blocking panels that can be used alongside other features.
- 🐛 **Bug Fixes**: Improved menu closing behavior on desktop (close on mouse leave).

## Environments

| Environment | URL |
|-------------|-----|
| **Production** | https://itsocialist.github.io/cogs-calculator/ |
| **Staging** | https://itsocialist.github.io/cogs-calculator/staging/ |

## Development

```bash
# Development server with hot reload
npm run dev

# Type checking
npm run type-check

# Build for production
npm run build

# Preview production build
npm run preview
```

## Architecture

The calculator uses a React context-based architecture for state management:

- **ConfigContext** — User preferences (display units, themes)
- **useCalculator** — Core calculation logic and recipe state
- **recipeUtils** — Batch scaling and ingredient cost calculations

## Documentation

See the [GitHub Wiki](https://github.com/itsocialist/cogs-calculator/wiki) for detailed documentation:

- [Getting Started](https://github.com/itsocialist/cogs-calculator/wiki/Getting-Started)
- [Architecture](https://github.com/itsocialist/cogs-calculator/wiki/Architecture)
- [Calculation Methods](https://github.com/itsocialist/cogs-calculator/wiki/Calculation-Methods)

## Contributing

1. Create an issue for the feature/bug
2. Branch from `main` using conventional naming (`feat/description`, `fix/description`)
3. Submit PR with issue reference (`Fixes #123`)

## License

Private — All rights reserved.
