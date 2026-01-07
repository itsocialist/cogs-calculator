# Getting Started

## Prerequisites

- Node.js 18+
- npm or yarn

## Development Setup

```bash
# Clone the repository
git clone https://github.com/itsocialist/cogs-calculator.git
cd cogs-calculator

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

## Environments

| Environment | URL | Branch |
|-------------|-----|--------|
| Development | `http://localhost:5173` | local |
| Staging | `https://itsocialist.github.io/cogs-calculator/staging/` | staging |
| Production | `https://itsocialist.github.io/cogs-calculator/` | main |

## Workflow

1. **Dev** - Test changes locally first
2. **Stage** - Push to staging branch, verify on staging URL
3. **Release** - Tag with version, deploy to production

See `/testing-workflow` for detailed testing order.
