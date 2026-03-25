"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const glassPanelVariants = cva(
  "relative text-white bg-white/10 border border-white/40 backdrop-blur-xl backdrop-saturate-150",
  {
    variants: {
      variant: {
        default: "shadow-[0_8px_32px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.60),inset_0_-1px_0_rgba(255,255,255,0.10)]",
        elevated: "shadow-[0_8px_32px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.60),inset_0_-1px_0_rgba(255,255,255,0.10)] shadow-ambient",
        flat: "backdrop-saturate-100",
      },
      rounded: {
        default: "rounded-lg",
        none: "",
        sm: "rounded-md",
        lg: "rounded-xl",
        xl: "rounded-2xl",
        "2xl": "rounded-3xl",
        full: "rounded-full",
      },
      padding: {
        none: "",
        sm: "p-3",
        default: "p-4",
        lg: "p-6",
        xl: "p-8",
      },
      shine: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      {
        shine: true,
        className: "before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/50 before:via-white/10 before:to-transparent before:pointer-events-none before:rounded-[inherit] after:absolute after:inset-0 after:bg-gradient-to-tl after:from-white/20 after:via-transparent after:to-transparent before:opacity-100 after:opacity-100 after:pointer-events-none after:rounded-[inherit]",
      },
    ],
    defaultVariants: {
      variant: "default",
      rounded: "default",
      padding: "default",
      shine: true,
    },
  }
)

interface GlassPanelProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassPanelVariants> {
  asChild?: boolean
}

function GlassPanel({
  className,
  variant,
  rounded,
  padding,
  shine,
  children,
  ...props
}: GlassPanelProps) {
  return (
    <div
      data-slot="glass-panel"
      className={cn(glassPanelVariants({ variant, rounded, padding, shine, className }))}
      {...props}
    >
      {children}
    </div>
  )
}

// Glass Container - for larger sections with background
const glassContainerVariants = cva(
  "relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-white/10 backdrop-blur-xl backdrop-saturate-150 border border-white/40",
        dark: "bg-white/5 backdrop-blur-xl backdrop-saturate-150 border border-white/40",
        light: "bg-white/15 backdrop-blur-xl backdrop-saturate-150 border border-white/40",
      },
      rounded: {
        default: "rounded-xl",
        none: "",
        sm: "rounded-md",
        lg: "rounded-2xl",
        xl: "rounded-3xl",
        "2xl": "rounded-3xl",
        full: "rounded-full",
      },
      padding: {
        none: "",
        default: "p-4",
        lg: "p-6",
        xl: "p-8",
      },
      shadow: {
        default: "shadow-[0_8px_32px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.60),inset_0_-1px_0_rgba(255,255,255,0.10)]",
        elevated: "shadow-[0_8px_32px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.60),inset_0_-1px_0_rgba(255,255,255,0.10)] shadow-ambient",
        none: "",
      },
    },
    defaultVariants: {
      variant: "default",
      rounded: "default",
      padding: "default",
      shadow: "default",
    },
  }
)

interface GlassContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassContainerVariants> {}

function GlassContainer({
  className,
  variant,
  rounded,
  padding,
  shadow,
  children,
  ...props
}: GlassContainerProps) {
  return (
    <div
      data-slot="glass-container"
      className={cn(glassContainerVariants({ variant, rounded, padding, shadow, className }))}
      {...props}
    >
      {/* Gradient overlays */}
      <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-br from-white/50 via-white/10 to-transparent pointer-events-none" />
      <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-tl from-white/20 via-transparent to-transparent pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

export { GlassPanel, glassPanelVariants, GlassContainer, glassContainerVariants }