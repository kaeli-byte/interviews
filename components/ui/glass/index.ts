// Liquid Glass UI Components
// These components implement the "Liquid Glass Cognitive Canvas" design system
// See DESIGN.md for specifications

export { GlassButton, glassButtonVariants } from "./GlassButton"
export { GlassCard, glassCardVariants } from "./GlassCard"
export { GlassInput, glassInputVariants } from "./GlassInput"
export { GlassIconButton, glassIconButtonVariants } from "./GlassIconButton"

// Utility class exports for direct CSS usage
// These map to the CSS classes defined in app/globals.css
export const glassClasses = {
  // Base utilities
  glass: "glass",
  glassPanel: "glass-panel",
  glassShadow: "glass-shadow",
  glassShine: "glass-shine",

  // Component classes
  glassButton: "glass-button",
  glassCard: "glass-card",
  glassInput: "glass-input",
  glassIconButton: "glass-icon-button",

  // Gradient utilities
  editorialGradient: "editorial-gradient",
  ghostBorder: "ghost-border",

  // Shadow utilities
  shadowAmbient: "shadow-ambient",
  shadowAmbientLg: "shadow-ambient-lg",

  // Typography
  fontHeading: "font-heading",
} as const