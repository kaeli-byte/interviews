"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const glassCardVariants = cva(
  // Base glass card styles from globals.css .glass-card
  "relative text-white",
  {
    variants: {
      variant: {
        default: "glass-card",
        panel: "glass-panel glass-shadow glass-shine rounded-xl p-4",
        elevated: "glass-panel glass-shadow glass-shine rounded-xl p-4 shadow-ambient",
      },
      padding: {
        none: "",
        sm: "p-3",
        default: "p-4",
        lg: "p-6",
        xl: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
    },
  }
)

interface GlassCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassCardVariants> {}

function GlassCard({
  className,
  variant = "default",
  padding = "default",
  ...props
}: GlassCardProps) {
  return (
    <div
      data-slot="glass-card"
      className={cn(glassCardVariants({ variant, padding, className }))}
      {...props}
    />
  )
}

export { GlassCard, glassCardVariants }