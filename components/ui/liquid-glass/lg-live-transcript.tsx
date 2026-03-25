"use client"

import { useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Bot, User, Mic } from "lucide-react"
import type { TranscriptEntry } from "@/lib/types"

interface LiveTranscriptPanelProps {
    transcript: TranscriptEntry[]
    isRecording: boolean
    status: 'connecting' | 'talking' | 'listening' | 'finished'
    className?: string
}

/**
 * LiveTranscriptPanel - Real-time interview transcript with liquid glass styling
 *
 * Design: Wet-glass aesthetic with dual gradient overlays, multi-layer shadows,
 * and smooth animations for new messages. Read-only display that auto-scrolls.
 */
export function LiveTranscriptPanel({
    transcript,
    isRecording,
    status,
    className,
}: LiveTranscriptPanelProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [transcript])

    // Format timestamp from ms to MM:SS
    const formatTimestamp = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000)
        const minutes = Math.floor(totalSeconds / 60)
        const seconds = totalSeconds % 60
        return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }

    return (
        <div
            className={cn(
                // Base glass container
                "relative flex h-[400px] w-full max-w-md flex-col rounded-2xl border border-white/40",
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
        >
            {/* Header */}
            <div className="relative z-10 flex items-center gap-3 border-b border-white/20 px-4 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]">
                    <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-white">Live Transcript</h3>
                    <p className="text-xs text-white/60">Real-time conversation</p>
                </div>
                {/* Status Indicator */}
                <div className="ml-auto flex items-center gap-1.5">
                    <span
                        className={cn(
                            "h-2 w-2 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.6)]",
                            status === 'listening' && "animate-pulse bg-emerald-400",
                            status === 'talking' && "animate-pulse bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]",
                            status === 'connecting' && "animate-pulse bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]",
                            status === 'finished' && "bg-white/40"
                        )}
                    />
                    <span className="text-xs text-white/60 capitalize">{status}</span>
                </div>
            </div>

            {/* Messages */}
            <div className="relative z-10 flex-1 overflow-y-auto px-4 py-3">
                {transcript.length === 0 ? (
                    // Empty state
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4">
                            <Mic className={cn(
                                "h-8 w-8 text-white/40",
                                isRecording && "text-white/70 animate-pulse"
                            )} />
                        </div>
                        <p className="text-sm text-white/50">
                            {status === 'connecting'
                                ? "Connecting to interviewer..."
                                : "Conversation will appear here"}
                        </p>
                        {status === 'listening' && (
                            <p className="text-xs text-white/30 mt-2">Speak naturally into your microphone</p>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {transcript.map((entry, index) => (
                            <div
                                key={`${entry.timestamp}-${index}`}
                                className={cn(
                                    "flex gap-2.5 animate-in fade-in-0 slide-in-from-bottom-2 duration-300",
                                    entry.speaker === 'candidate' ? "flex-row-reverse" : "flex-row"
                                )}
                            >
                                {/* Avatar */}
                                <div
                                    className={cn(
                                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                                        entry.speaker === 'candidate'
                                            ? "bg-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]"
                                            : "bg-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]"
                                    )}
                                >
                                    {entry.speaker === 'candidate' ? (
                                        <User className="h-4 w-4 text-white" />
                                    ) : (
                                        <Bot className="h-4 w-4 text-white" />
                                    )}
                                </div>

                                {/* Message Bubble */}
                                <div className="flex flex-col gap-0.5 max-w-[75%]">
                                    <div
                                        className={cn(
                                            "rounded-2xl px-3.5 py-2.5",
                                            entry.speaker === 'candidate'
                                                ? "bg-white/30 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]"
                                                : "bg-white/15 text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]"
                                        )}
                                    >
                                        <p className="text-sm leading-relaxed">{entry.text}</p>
                                    </div>
                                    <span className={cn(
                                        "text-[10px] text-white/40 px-1",
                                        entry.speaker === 'candidate' ? "text-right" : "text-left"
                                    )}>
                                        {formatTimestamp(entry.timestamp)}
                                    </span>
                                </div>
                            </div>
                        ))}

                        {/* AI Typing Indicator */}
                        {status === 'talking' && (
                            <div className="flex gap-2.5 animate-in fade-in-0 duration-200">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]">
                                    <Bot className="h-4 w-4 text-white" />
                                </div>
                                <div className="flex items-center gap-1 rounded-2xl bg-white/15 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]">
                                    <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-400/80 [animation-delay:0ms]" />
                                    <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-400/80 [animation-delay:150ms]" />
                                    <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-400/80 [animation-delay:300ms]" />
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Footer - Recording Status */}
            <div className="relative z-10 border-t border-white/20 px-4 py-2.5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className={cn(
                            "h-2 w-2 rounded-full transition-colors",
                            isRecording ? "bg-emerald-400 animate-pulse" : "bg-white/30"
                        )} />
                        <span className="text-xs text-white/60">
                            {isRecording ? "Recording" : "Paused"}
                        </span>
                    </div>
                    <span className="text-xs text-white/40">
                        {transcript.length} messages
                    </span>
                </div>
            </div>
        </div>
    )
}