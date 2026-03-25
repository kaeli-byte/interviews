"use client"

import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const glassIconButtonVariants = cva(
  // Base glass icon button styles from globals.css .glass-icon-button
  "relative inline-flex items-center justify-center text-white transition-all duration-300 cursor-pointer outline-none select-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "glass-icon-button",
        rounded: "glass-icon-button rounded-full",
        ghost: "glass hover:bg-white/30 rounded-lg",
      },
      size: {
        default: "size-12",
        sm: "size-10 [&_svg]:size-4",
        lg: "size-14 [&_svg]:size-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface GlassIconButtonProps
  extends ButtonPrimitive.Props,
    VariantProps<typeof glassIconButtonVariants> {
  "aria-label"?: string
}

function GlassIconButton({
  className,
  variant = "default",
  size = "default",
  ...props
}: GlassIconButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="glass-icon-button"
      className={cn(glassIconButtonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { GlassIconButton, glassIconButtonVariants }