# Dawson Bros Kitchen — Style Guide

## Brand Essence

**Ethereal Wellness** — A visual language that conveys organic healing, botanical science, and handcrafted care. The aesthetic bridges nature and precision, evoking morning mist through hemp fields at golden hour.

---

## Color Palette

### Primary Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Amber Gold** | `#F59E0B` | CTAs, highlights, warmth |
| **Emerald Sage** | `#10B981` | Accents, wellness indicators |
| **Deep Forest** | `#064E3B` | Text overlays, depth |

### Neutral Foundation

| Name | Hex | Usage |
|------|-----|-------|
| **Warm Mist** | `rgba(255,255,255,0.10)` | Glassmorphism backgrounds |
| **Soft Fog** | `rgba(255,255,255,0.20)` | Borders, dividers |
| **Earth Dark** | `#1E1E1E` | Base backgrounds |

### Gradient Tokens

```css
/* Primary Brand Gradient */
background: linear-gradient(to right, #F59E0B, #10B981);

/* Ethereal Overlay */
background: linear-gradient(to bottom-right, 
  rgba(120, 53, 15, 0.4),   /* amber-900/40 */
  rgba(6, 78, 59, 0.3),     /* emerald-900/30 */
  rgba(15, 23, 42, 0.6)     /* slate-900/60 */
);
```

---

## Typography

### Font Stack
- **Display**: `font-light tracking-[0.3em]` — Ethereal headers
- **Body**: `tracking-wider` — Readable content
- **Accent**: `tracking-widest uppercase text-xs` — Labels, tags

### Text Colors
- **Primary**: `text-white/90`
- **Secondary**: `text-white/50`
- **Muted**: `text-white/30`

---

## Glassmorphism

The signature glass card effect:

```css
.glass-card {
  backdrop-filter: blur(24px);           /* backdrop-blur-xl */
  background: rgba(255, 255, 255, 0.1);  /* bg-white/10 */
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1.5rem;                 /* rounded-3xl */
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}
```

---

## Ambient Effects

### Glow Orbs
Pulsing ambient light sources that create depth:

```jsx
<div className="absolute w-96 h-96 bg-amber-400/20 rounded-full blur-3xl animate-pulse" />
<div className="absolute w-80 h-80 bg-emerald-400/15 rounded-full blur-3xl animate-pulse" 
     style={{ animationDelay: '1s' }} />
```

### Particle System (Biology + Chemistry)
Floating particles representing molecular connections:
- **Pollen particles**: Small, warm, drift slowly
- **Molecular nodes**: Connect with subtle lines
- **Movement**: Organic, non-linear, reactive to viewport

---

## Interaction Patterns

### Buttons
```jsx
// Primary CTA
className="bg-gradient-to-r from-amber-500 to-emerald-500 
           hover:from-amber-400 hover:to-emerald-400
           hover:scale-[1.02] active:scale-[0.98]
           shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40"
```

### Inputs
```jsx
className="bg-white/5 border border-white/20 
           focus:border-amber-400/50 focus:bg-white/10
           placeholder-white/40"
```

---

## Imagery Guidelines

### Background Photography
- **Lighting**: Golden hour, morning mist
- **Subject**: Hemp plants, botanical elements, dewdrops
- **Depth**: Shallow DOF with bokeh
- **Mood**: Serene, healing, organic

### Icon Treatment
- Use emoji or simple line icons
- Gradient backgrounds for icon containers
- Subtle glow shadows (`shadow-amber-500/30`)

---

## Motion Principles

1. **Organic**: No harsh linear movements
2. **Subtle**: Micro-animations, not distracting
3. **Purposeful**: Motion conveys meaning
4. **Ambient**: Background elements breathe slowly

---

*Dawson Bros Kitchen — Handcrafted Wellness*
