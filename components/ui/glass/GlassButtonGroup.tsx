"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const glassButtonGroupVariants = cva(
  "inline-flex overflow-hidden border border-white/50 backdrop-blur-sm",
  {
    variants: {
      variant: {
        default: "bg-black/20",
        elevated: "bg-black/20 shadow-[inset_0_1px_0px_rgba(255,255,255,0.75),0_0_9px_rgba(0,0,0,0.2),0_3px_8px_rgba(0,0,0,0.15)]",
      },
      rounded: {
        default: "rounded-lg",
        full: "rounded-full",
        xl: "rounded-xl",
      },
      size: {
        default: "",
        sm: "text-xs",
        lg: "text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      rounded: "default",
      size: "default",
    },
  }
)

interface GlassButtonGroupProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassButtonGroupVariants> {
  children: React.ReactNode
}

function GlassButtonGroup({
  className,
  variant,
  rounded,
  size,
  children,
  ...props
}: GlassButtonGroupProps) {
  return (
    <div
      data-slot="glass-button-group"
      className={cn(glassButtonGroupVariants({ variant, rounded, size, className }))}
      role="group"
      {...props}
    >
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          const isLast = index === React.Children.count(children) - 1
          return React.cloneElement(child as React.ReactElement<{ className?: string }>, {
            className: cn(
              "relative inline-flex items-center justify-center px-4 py-2 text-white text-sm font-medium bg-white/2.5 backdrop-blur-sm shadow-[inset_0_1px_0px_rgba(255,255,255,0.75),0_0_9px_rgba(0,0,0,0.2),0_3px_8px_rgba(0,0,0,0.15)] hover:bg-white/30 transition-all duration-300",
              "before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/60 before:via-transparent before:to-transparent before:opacity-70 before:pointer-events-none",
              "after:absolute after:inset-0 after:bg-gradient-to-tl after:from-white/30 after:via-transparent after:to-transparent after:opacity-50 after:pointer-events-none",
              "first:rounded-l-lg last:rounded-r-lg",
              !isLast && "border-r border-white/50",
              (child as React.ReactElement<{ className?: string }>).props?.className
            ),
          })
        }
        return child
      })}
    </div>
  )
}

export { GlassButtonGroup, glassButtonGroupVariants }