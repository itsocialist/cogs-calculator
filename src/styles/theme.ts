/**
 * Centralized Glass UI Style System
 * Use these constants for consistent styling across the application
 */

// Glass panel and card backgrounds
export const glass = {
    /** Primary panel: semi-transparent dark with blur */
    panel: "bg-stone-900/50 backdrop-blur-xl border border-white/15",
    /** Darker panel variant for more contrast */
    panelDark: "bg-stone-900/70 backdrop-blur-xl border border-white/15",
    /** Card elements inside panels */
    card: "bg-stone-800/60 border border-white/15",
    /** Light card for subtle contrast */
    cardLight: "bg-white/5 border border-white/10",
    /** Modal/overlay background */
    modal: "bg-stone-900/95 backdrop-blur-xl border border-white/15",
} as const;

// Form element styles
export const form = {
    /** Standard input field */
    input: "bg-stone-800/60 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/40 focus:border-amber-400/50 focus:outline-none",
    /** Select dropdown */
    select: "bg-stone-800/60 border border-white/20 rounded-lg px-3 py-2 text-white font-medium focus:border-amber-400/50 focus:outline-none",
    /** Label above inputs */
    label: "text-white/60 text-xs font-bold uppercase block mb-2",
} as const;

// Text color hierarchy
export const text = {
    /** Primary text - highest contrast */
    primary: "text-white/90",
    /** Secondary text - section headers */
    secondary: "text-white/70",
    /** Muted text - descriptions, hints */
    muted: "text-white/50",
    /** Subtle text - least important */
    subtle: "text-white/40",
    /** Label text - uppercase small */
    label: "text-white/60 text-xs font-bold uppercase",
} as const;

// Selection/active state pattern (amber highlight from Edibles)
export const selection = {
    /** Active/selected state */
    active: "border-amber-400/60 bg-amber-500/20 shadow-md shadow-amber-500/10",
    /** Inactive/default state */
    inactive: "border-white/15 bg-stone-800/50 hover:border-white/25 hover:bg-stone-800/70",
    /** Active text */
    activeText: "text-white",
    /** Inactive text */
    inactiveText: "text-white/70",
    /** Active icon */
    activeIcon: "text-amber-400",
    /** Inactive icon */
    inactiveIcon: "text-white/40",
} as const;

// Status indicators (TOP border stripe)
export const status = {
    /** Success/positive status */
    success: "border-t-4 border-t-emerald-400/60",
    /** Warning/caution status */
    warning: "border-t-4 border-t-amber-400/60",
    /** Error/critical status */
    error: "border-t-4 border-t-red-400/60",
    /** Info/neutral status */
    info: "border-t-4 border-t-blue-400/60",
} as const;

// Button styles
export const button = {
    /** Primary action button */
    primary: "bg-amber-500/80 hover:bg-amber-500 text-white font-medium rounded-lg px-4 py-2 transition-colors",
    /** Secondary/ghost button */
    secondary: "bg-white/15 backdrop-blur-sm hover:bg-white/20 text-white font-medium rounded-lg px-4 py-2 border border-white/10 transition-colors",
    /** Disabled button */
    disabled: "bg-stone-700/50 text-white/40 cursor-not-allowed rounded-lg px-4 py-2",
} as const;

// Shadow system
export const shadow = {
    sm: "shadow-md shadow-black/20",
    md: "shadow-lg shadow-black/25",
    lg: "shadow-xl shadow-black/30",
} as const;

// Combine utilities for common patterns
export const patterns = {
    /** Standard glass card with shadow */
    glassCard: `${glass.panel} ${shadow.md} rounded-xl`,
    /** Interactive selection card - inactive */
    selectableCard: `${glass.card} ${selection.inactive} rounded-lg transition-all cursor-pointer`,
    /** Interactive selection card - active */
    selectableCardActive: `${glass.card} ${selection.active} rounded-lg transition-all cursor-pointer`,
} as const;
