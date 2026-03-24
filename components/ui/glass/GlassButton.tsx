"use client"

import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const glassButtonVariants = cva(
  // Base glass button styles from globals.css .glass-button
  "relative inline-flex items-center justify-center text-sm font-medium text-white transition-all duration-300 cursor-pointer outline-none select-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "glass-button",
        primary: "glass-button editorial-gradient text-white",
        ghost: "glass hover:bg-white/30",
      },
      size: {
        default: "h-10 gap-2 px-4 py-2 rounded-lg",
        sm: "h-8 gap-1.5 px-3 py-1.5 text-xs rounded-md",
        lg: "h-12 gap-2 px-6 py-3 rounded-xl text-base",
        icon: "size-10 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function GlassButton({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof glassButtonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="glass-button"
      className={cn(glassButtonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { GlassButton, glassButtonVariants }