"use client"

import { cn } from "@/lib/utils"
import { Mic } from "lucide-react"

interface LiquidGlassVoiceAssistantProps {
    className?: string
}

export function LiquidGlassVoiceAssistant({ className }: LiquidGlassVoiceAssistantProps) {
    return (
        <div
            className={cn(
                // Base glass container
                "relative w-80 rounded-2xl border border-white/40",
                "bg-white/10 backdrop-blur-xl backdrop-saturate-150",
                // Complex shadow system for depth
                "shadow-[0_8px_32px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.6),inset_0_-1px_0_rgba(255,255,255,0.1)]",
                // Top highlight gradient
                "before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl",
                "before:bg-gradient-to-b before:from-white/50 before:via-white/10 before:to-transparent",
                // Subtle edge glow
                "after:pointer-events-none after:absolute after:inset-0 after:rounded-2xl",
                "after:bg-gradient-to-tr after:from-white/20 after:via-transparent after:to-white/10",
                "p-4 text-white transition-all duration-300 hover:bg-white/15",
                className
            )}
        >
            <div className="relative z-10">
                {/* Header */}
                <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-medium opacity-90">AI Voice Assistant</span>
                    <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
                        <span className="text-xs opacity-70">Listening</span>
                    </div>
                </div>

                {/* Microphone Button */}
                <div className="mb-4 text-center">
                    <button
                        aria-label="Activate voice assistant"
                        className={cn(
                            "group inline-flex h-16 w-16 items-center justify-center rounded-full",
                            "border border-white/30 bg-white/20 backdrop-blur-sm",
                            "shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_4px_12px_rgba(0,0,0,0.15)]",
                            "transition-all duration-300",
                            "hover:bg-white/30 hover:scale-105",
                            "active:scale-95"
                        )}
                    >
                        <Mic className="h-8 w-8 text-white transition-transform duration-200 group-hover:scale-110" />
                    </button>
                </div>

                {/* Audio Waveform Visualization */}
                <div className="mb-4">
                    <div className="mb-2 flex items-center justify-center gap-1">
                        {[4, 6, 3, 8, 2, 5, 7].map((height, index) => (
                            <div
                                key={index}
                                className="w-1 animate-pulse rounded-full bg-white/70"
                                style={{
                                    height: `${height * 4}px`,
                                    animationDelay: `${index * 100}ms`,
                                }}
                            />
                        ))}
                    </div>
                    <p className="text-center text-xs opacity-70">
                        Say &quot;Hey AI&quot; to start speaking
                    </p>
                </div>
            </div>
        </div>
    )
}
