import { cn } from "@/lib/utils"
import type { ReactNode, HTMLAttributes } from "react"

interface LiquidGlassCardProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode
    className?: string
}

export function LiquidGlassCard({ children, className, ...props }: LiquidGlassCardProps) {
    return (
        <div
            className={cn(
                // Base glass container
                "relative rounded-2xl border border-white/40",
                "bg-white/10 backdrop-blur-xl backdrop-saturate-150",
                // Complex shadow system for depth
                "shadow-[0_8px_32px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.6),inset_0_-1px_0_rgba(255,255,255,0.1)]",
                // Top highlight gradient
                "before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl",
                "before:bg-gradient-to-b before:from-white/50 before:via-white/10 before:to-transparent",
                // Subtle edge glow
                "after:pointer-events-none after:absolute after:inset-0 after:rounded-2xl",
                "after:bg-gradient-to-tr after:from-white/20 after:via-transparent after:to-white/10",
                className
            )}
            {...props}
        >
            <div className="relative z-10">{children}</div>
        </div>
    )
}

interface LiquidGlassButtonProps {
    children: ReactNode
    className?: string
    onClick?: () => void
    ariaLabel?: string
}

export function LiquidGlassButton({
    children,
    className,
    onClick,
    ariaLabel,
}: LiquidGlassButtonProps) {
    return (
        <button
            onClick={onClick}
            aria-label={ariaLabel}
            className={cn(
                // Base glass button
                "relative rounded-xl border border-white/30",
                "bg-white/15 backdrop-blur-sm",
                "p-2.5 transition-all duration-300",
                // Hover state
                "hover:bg-white/25 hover:border-white/50 hover:scale-105",
                // Active state
                "active:scale-95 active:bg-white/20",
                // Subtle inner glow
                "shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2px_8px_rgba(0,0,0,0.08)]",
                className
            )}
        >
            {children}
        </button>
    )
}
