"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const glassSearchInputVariants = cva(
  "relative w-full",
  {
    variants: {
      size: {
        default: "w-80",
        sm: "w-64",
        lg: "w-96",
        full: "w-full",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

interface GlassSearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof glassSearchInputVariants> {
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  onRightIconClick?: () => void
}

function GlassSearchInput({
  className,
  size,
  leftIcon,
  rightIcon,
  onRightIconClick,
  placeholder = "Search...",
  ...props
}: GlassSearchInputProps) {
  return (
    <div className={cn(glassSearchInputVariants({ size, className }))}>
      <input
        type="text"
        placeholder={placeholder}
        className={cn(
          "w-full py-2 text-white text-sm bg-black/20 border border-white/50 backdrop-blur-sm",
          "shadow-[inset_0_1px_0px_rgba(255,255,255,0.75),0_0_9px_rgba(0,0,0,0.2),0_3px_8px_rgba(0,0,0,0.15)]",
          "placeholder:text-white/70 focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/30",
          "transition-all duration-300 relative",
          "before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-white/60 before:via-transparent before:to-transparent before:opacity-70 before:pointer-events-none",
          "after:absolute after:inset-0 after:rounded-lg after:bg-gradient-to-tl after:from-white/30 after:via-transparent after:to-transparent after:opacity-50 after:pointer-events-none",
          leftIcon ? "pl-10" : "pl-4",
          rightIcon ? "pr-12" : "pr-4",
          "rounded-full"
        )}
        {...props}
      />

      {/* Left icon */}
      {leftIcon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 pointer-events-none">
          {leftIcon}
        </div>
      )}

      {/* Right icon/button */}
      {rightIcon && (
        <button
          type="button"
          onClick={onRightIconClick}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white transition-colors duration-200"
        >
          {rightIcon}
        </button>
      )}
    </div>
  )
}

export { GlassSearchInput, glassSearchInputVariants }