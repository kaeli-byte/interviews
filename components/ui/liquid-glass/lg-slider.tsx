"use client"

import { cn } from "@/lib/utils"
import { useState } from "react"
import { Volume2, Sun, Gauge } from "lucide-react"

interface LiquidGlassSliderProps {
    label?: string
    icon?: React.ReactNode
    min?: number
    max?: number
    defaultValue?: number
    onChange?: (value: number) => void
    className?: string
}

export function LiquidGlassSlider({
    label,
    icon,
    min = 0,
    max = 100,
    defaultValue = 50,
    onChange,
    className,
}: LiquidGlassSliderProps) {
    const [value, setValue] = useState(defaultValue)
    const percentage = ((value - min) / (max - min)) * 100

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = Number(e.target.value)
        setValue(newValue)
        onChange?.(newValue)
    }

    return (
        <div className={cn("flex flex-col gap-3", className)}>
            {(label || icon) && (
                <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-2">
                        {icon && <span className="text-white/70">{icon}</span>}
                        {label && (
                            <span className="text-sm font-medium drop-shadow-sm">{label}</span>
                        )}
                    </div>
                    <span className="text-sm font-semibold tabular-nums">{value}</span>
                </div>
            )}
            <div
                className={cn(
                    "relative h-2 w-full rounded-full",
                    "bg-white/10 backdrop-blur-sm",
                    "border border-white/20",
                    "shadow-[inset_0_1px_3px_rgba(0,0,0,0.2)]"
                )}
            >
                {/* Filled track */}
                <div
                    className={cn(
                        "absolute left-0 top-0 h-full rounded-full",
                        "bg-gradient-to-r from-white/60 to-white/40",
                        "shadow-[0_0_8px_rgba(255,255,255,0.3)]"
                    )}
                    style={{ width: `${percentage}%` }}
                />
                {/* Thumb */}
                <div
                    className={cn(
                        "absolute top-1/2 -translate-y-1/2 -translate-x-1/2",
                        "h-5 w-5 rounded-full",
                        "bg-white/90 backdrop-blur-md",
                        "border border-white/60",
                        "shadow-[0_2px_8px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.8)]",
                        "transition-transform duration-150",
                        "hover:scale-110"
                    )}
                    style={{ left: `${percentage}%` }}
                />
                {/* Hidden input for accessibility */}
                <input
                    type="range"
                    min={min}
                    max={max}
                    value={value}
                    onChange={handleChange}
                    className="absolute inset-0 w-full cursor-pointer opacity-0"
                    aria-label={label}
                />
            </div>
        </div>
    )
}

export function LiquidGlassSliderCard() {
    return (
        <div
            className={cn(
                "relative w-full max-w-xs rounded-2xl border border-white/40",
                "bg-white/10 backdrop-blur-xl backdrop-saturate-150",
                "shadow-[0_8px_32px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.6),inset_0_-1px_0_rgba(255,255,255,0.1)]",
                "before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl",
                "before:bg-gradient-to-b before:from-white/50 before:via-white/10 before:to-transparent",
                "after:pointer-events-none after:absolute after:inset-0 after:rounded-2xl",
                "after:bg-gradient-to-tr after:from-white/20 after:via-transparent after:to-white/10",
                "p-6"
            )}
        >
            <div className="relative z-10 flex flex-col gap-6">
                <h3 className="text-lg font-semibold text-white drop-shadow-sm">
                    Settings
                </h3>
                <LiquidGlassSlider
                    label="Volume"
                    icon={<Volume2 className="h-4 w-4" />}
                    defaultValue={65}
                />
                <LiquidGlassSlider
                    label="Brightness"
                    icon={<Sun className="h-4 w-4" />}
                    defaultValue={80}
                />
                <LiquidGlassSlider
                    label="Speed"
                    icon={<Gauge className="h-4 w-4" />}
                    defaultValue={45}
                />
            </div>
        </div>
    )
}
