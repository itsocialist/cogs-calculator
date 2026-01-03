# Staging Environment Strategy

## Overview
To allow for safe testing of features (like the new Math Panel or Config Units) before production deployment, we recommend a **Branch-Based Staging Strategy** compatible with GitHub Pages.

## Strategy: `staging` Branch

1.  **Branching Model**:
    *   `main`: Production accessible code.
    *   `staging`: Pre-production capabilities.
    *   `feature/*`: Active development.

2.  **Deployment Workflow**:
    *   **Production**: Pushing to `main` triggers the existing deploy workflow -> `gh-pages` (Root).
    *   **Staging**: Pushing to `staging` triggers a NEW workflow -> `gh-pages` (Folder: `/staging`).

## Implementation Steps

### 1. Create Staging Workflow (`.github/workflows/deploy-staging.yml`)

Copy the existing `deploy.yml` but modify the `base-href` and `destination-dir`.

```yaml
name: Deploy to Staging
on:
  push:
    branches: [ staging ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Install and Build (Staging)
        run: |
          npm ci
          # Set base href to /cogs-calculator/staging/
          npm run build -- --base=/cogs-calculator/staging/

      - name: Deploy
        uses: JamesIves/github-pages-deploy-action@v4
        with:
          folder: dist
          branch: gh-pages
          target-folder: staging
          clean: true # Only clean the staging folder
```

### 2. Vite Configuration Update

Ensure `vite.config.ts` accepts a base URL from the command line or environment variable.

### 3. Usage

1.  `git checkout -b staging`
2.  `git push origin staging`
3.  Access: `https://[username].github.io/cogs-calculator/staging/`
