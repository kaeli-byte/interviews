"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const glassInputVariants = cva(
  // Base glass input styles from globals.css .glass-input
  "glass-input placeholder:text-white/70 focus:bg-white/15",
  {
    variants: {
      size: {
        default: "h-10 px-4 text-sm",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-5 text-base",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

interface GlassInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof glassInputVariants> {}

function GlassInput({
  className,
  size = "default",
  type = "text",
  ...props
}: GlassInputProps) {
  return (
    <input
      type={type}
      data-slot="glass-input"
      className={cn(glassInputVariants({ size, className }))}
      {...props}
    />
  )
}

export { GlassInput, glassInputVariants }