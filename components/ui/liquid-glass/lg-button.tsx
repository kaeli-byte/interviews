"use client"

import { cn } from "@/lib/utils"
import type { ReactNode, ButtonHTMLAttributes } from "react"
import { Loader2 } from "lucide-react"

type ButtonVariant = "default" | "primary" | "danger" | "ghost"
type ButtonSize = "sm" | "md" | "lg" | "icon"

interface LiquidGlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode
    variant?: ButtonVariant
    size?: ButtonSize
    loading?: boolean
    leftIcon?: ReactNode
    rightIcon?: ReactNode
}

const variantStyles: Record<ButtonVariant, string> = {
    default: cn(
        "bg-white/15 border-white/30",
        "hover:bg-white/25 hover:border-white/50",
        "active:bg-white/20"
    ),
    primary: cn(
        "bg-white/25 border-white/50",
        "hover:bg-white/35 hover:border-white/60",
        "active:bg-white/30",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_4px_12px_rgba(0,0,0,0.15)]"
    ),
    danger: cn(
        "bg-red-500/20 border-red-400/40",
        "hover:bg-red-500/30 hover:border-red-400/60",
        "active:bg-red-500/25",
        "text-red-100"
    ),
    ghost: cn(
        "bg-transparent border-transparent",
        "hover:bg-white/10 hover:border-white/20",
        "active:bg-white/15"
    ),
}

const sizeStyles: Record<ButtonSize, string> = {
    sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
    md: "px-4 py-2 text-sm rounded-xl gap-2",
    lg: "px-6 py-3 text-base rounded-xl gap-2.5",
    icon: "p-2.5 rounded-xl",
}

export function LiquidGlassActionButton({
    children,
    className,
    variant = "default",
    size = "md",
    loading = false,
    disabled,
    leftIcon,
    rightIcon,
    ...props
}: LiquidGlassButtonProps) {
    return (
        <button
            disabled={disabled || loading}
            className={cn(
                // Base glass button
                "relative inline-flex items-center justify-center border font-medium",
                "backdrop-blur-sm transition-all duration-300",
                // Hover & active transforms
                "hover:scale-105 active:scale-95",
                // Subtle inner glow (default)
                "shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2px_8px_rgba(0,0,0,0.08)]",
                // Text color
                "text-white",
                // Disabled state
                "disabled:pointer-events-none disabled:opacity-50",
                // Variant & size
                variantStyles[variant],
                sizeStyles[size],
                className
            )}
            {...props}
        >
            {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <>
                    {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
                    {children}
                    {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
                </>
            )}
        </button>
    )
}

// Button group for related actions
interface LiquidGlassButtonGroupProps {
    children: ReactNode
    className?: string
}

export function LiquidGlassButtonGroup({ children, className }: LiquidGlassButtonGroupProps) {
    return (
        <div
            className={cn(
                "inline-flex rounded-xl border border-white/30",
                "bg-white/10 backdrop-blur-xl backdrop-saturate-150",
                "shadow-[0_4px_16px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.4)]",
                "overflow-hidden",
                "[&>button]:rounded-none [&>button]:border-0 [&>button]:border-r [&>button]:border-white/20",
                "[&>button:last-child]:border-r-0",
                "[&>button]:shadow-none",
                className
            )}
        >
            {children}
        </div>
    )
}
