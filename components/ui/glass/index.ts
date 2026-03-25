// Liquid Glass UI Components
// These components implement the "Liquid Glass Cognitive Canvas" design system
// Based on David UI Tailwind CSS Library by Creative Tim

export { GlassButton, glassButtonVariants } from "./GlassButton"
export { GlassCard, glassCardVariants } from "./GlassCard"
export { GlassInput, glassInputVariants } from "./GlassInput"
export { GlassIconButton, glassIconButtonVariants } from "./GlassIconButton"
export { GlassButtonGroup, glassButtonGroupVariants } from "./GlassButtonGroup"
export { GlassVoiceAssistant, glassVoiceAssistantVariants, AudioVisualizer, StatusIndicator } from "./GlassVoiceAssistant"
export { GlassSearchInput, glassSearchInputVariants } from "./GlassSearchInput"
export { GlassPanel, glassPanelVariants, GlassContainer, glassContainerVariants } from "./GlassPanel"

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