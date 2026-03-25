"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Mic, MicOff } from "lucide-react"
import { cn } from "@/lib/utils"

const glassVoiceAssistantVariants = cva(
  "relative p-4 text-white bg-black/20 border border-white/50 backdrop-blur-sm rounded-lg transition-all duration-300",
  {
    variants: {
      variant: {
        default: "shadow-[inset_0_1px_0px_rgba(255,255,255,0.75),0_0_9px_rgba(0,0,0,0.2),0_3px_8px_rgba(0,0,0,0.15)]",
        elevated: "shadow-[inset_0_1px_0px_rgba(255,255,255,0.75),0_0_9px_rgba(0,0,0,0.2),0_3px_8px_rgba(0,0,0,0.15)] hover:bg-white/30",
      },
      size: {
        default: "w-80",
        sm: "w-64",
        lg: "w-96",
        full: "w-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface AudioVisualizerProps {
  isActive: boolean
  barCount?: number
  className?: string
}

function AudioVisualizer({ isActive, barCount = 7, className }: AudioVisualizerProps) {
  return (
    <div className={cn("flex justify-center items-center gap-1", className)}>
      {Array.from({ length: barCount }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "w-1 bg-white/70 rounded-full transition-all duration-150",
            isActive && "animate-pulse"
          )}
          style={{
            height: `${12 + Math.random() * 20}px`,
            animationDelay: `${i * 100}ms`,
          }}
        />
      ))}
    </div>
  )
}

interface StatusIndicatorProps {
  status: "listening" | "speaking" | "idle" | "connecting"
  className?: string
}

function StatusIndicator({ status, className }: StatusIndicatorProps) {
  const statusConfig = {
    listening: { color: "bg-green-400", label: "Listening" },
    speaking: { color: "bg-primary", label: "Speaking" },
    idle: { color: "bg-white/50", label: "Ready" },
    connecting: { color: "bg-yellow-400", label: "Connecting" },
  }

  const config = statusConfig[status]

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className={cn("w-1.5 h-1.5 rounded-full", config.color, status === "listening" && "animate-pulse")} />
      <span className="text-xs opacity-70">{config.label}</span>
    </div>
  )
}

interface GlassVoiceAssistantProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassVoiceAssistantVariants> {
  title?: string
  status?: "listening" | "speaking" | "idle" | "connecting"
  isActive?: boolean
  onMicToggle?: () => void
  isMuted?: boolean
  placeholder?: string
  showVisualizer?: boolean
}

function GlassVoiceAssistant({
  className,
  variant,
  size,
  title = "AI Voice Assistant",
  status = "idle",
  isActive = false,
  onMicToggle,
  isMuted = false,
  placeholder = 'Say "Hey AI" to start speaking',
  showVisualizer = true,
  children,
  ...props
}: GlassVoiceAssistantProps) {
  return (
    <div
      data-slot="glass-voice-assistant"
      className={cn(glassVoiceAssistantVariants({ variant, size, className }))}
      {...props}
    >
      {/* Gradient overlays */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/60 via-transparent to-transparent opacity-70 pointer-events-none" />
      <div className="absolute inset-0 rounded-lg bg-gradient-to-tl from-white/30 via-transparent to-transparent opacity-50 pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium opacity-90">{title}</span>
          <StatusIndicator status={status} />
        </div>

        {/* Main mic button */}
        <div className="text-center mb-4">
          <button
            onClick={onMicToggle}
            className={cn(
              "inline-flex items-center justify-center w-16 h-16 rounded-full transition-all duration-300 cursor-pointer group",
              "bg-white/20 border border-white/30 backdrop-blur-sm",
              "shadow-[inset_0_1px_0px_rgba(255,255,255,0.75),0_0_9px_rgba(0,0,0,0.2),0_3px_8px_rgba(0,0,0,0.15)]",
              "hover:bg-white/30"
            )}
          >
            {isMuted ? (
              <MicOff className="w-8 h-8 text-white/60 group-hover:scale-110 transition-transform duration-200" />
            ) : (
              <Mic className={cn(
                "w-8 h-8 text-white group-hover:scale-110 transition-transform duration-200",
                isActive && "animate-pulse"
              )} />
            )}
          </button>
        </div>

        {/* Visualizer */}
        {showVisualizer && (
          <div className="mb-4">
            <AudioVisualizer isActive={isActive && !isMuted} />
            <p className="text-center text-xs opacity-70 mt-2">{placeholder}</p>
          </div>
        )}

        {/* Children for additional content */}
        {children}
      </div>
    </div>
  )
}

export { GlassVoiceAssistant, glassVoiceAssistantVariants, AudioVisualizer, StatusIndicator }