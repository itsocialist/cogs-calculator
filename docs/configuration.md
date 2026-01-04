# Configuration

Configuration is managed through `src/context/configContext.tsx`.

## Config Options

### Batch Settings

| Option | Type | Description |
|--------|------|-------------|
| `batch.type` | `'volume'` \| `'weight'` | Scale by volume or weight |
| `batch.volumeScale` | `'ml'` \| `'L'` \| `'gal'` | Volume unit |
| `batch.weightScale` | `'g'` \| `'kg'` \| `'lb'` | Weight unit |

### Display Settings

| Option | Type | Description |
|--------|------|-------------|
| `display.currency` | `string` | Currency symbol (default: `$`) |
| `display.decimals` | `number` | Decimal places for costs |

### Manifest Settings

| Option | Type | Description |
|--------|------|-------------|
| `manifest.weightScale` | `'g'` \| `'kg'` \| `'lb'` | Weight display in manifest |
| `manifest.volumeScale` | `'ml'` \| `'L'` \| `'gal'` | Volume display in manifest |

## Theme Constants

UI styles are centralized in `src/styles/theme.ts`:

```typescript
export const glass = {
  card: 'bg-stone-900/70 backdrop-blur-xl border border-white/15',
  panel: 'bg-stone-900/50 backdrop-blur-xl',
  // ...
};

export const text = {
  primary: 'text-white/90',
  secondary: 'text-white/70',
  muted: 'text-white/50',
};
```
