"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Send, Bot, User } from "lucide-react"

interface Message {
    id: string
    role: "user" | "assistant"
    content: string
}

export function LiquidGlassChat() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            role: "assistant",
            content: "Hello! I'm your AI assistant. How can I help you today?",
        },
    ])
    const [input, setInput] = useState("")
    const [isTyping, setIsTyping] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim()) return

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input.trim(),
        }

        setMessages((prev) => [...prev, userMessage])
        setInput("")
        setIsTyping(true)

        // Simulate AI response
        setTimeout(() => {
            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "Thanks for your message! This is a demo response. Connect me to a real AI backend to get intelligent responses.",
            }
            setMessages((prev) => [...prev, aiMessage])
            setIsTyping(false)
        }, 1500)
    }

    return (
        <div
            className={cn(
                // Base glass container
                "relative flex h-[420px] w-full max-w-sm flex-col rounded-2xl border border-white/40",
                "bg-white/10 backdrop-blur-xl backdrop-saturate-150",
                // Complex shadow system for depth
                "shadow-[0_8px_32px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.6),inset_0_-1px_0_rgba(255,255,255,0.1)]",
                // Top highlight gradient
                "before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl",
                "before:bg-gradient-to-b before:from-white/50 before:via-white/10 before:to-transparent",
                // Subtle edge glow
                "after:pointer-events-none after:absolute after:inset-0 after:rounded-2xl",
                "after:bg-gradient-to-tr after:from-white/20 after:via-transparent after:to-white/10"
            )}
        >
            {/* Header */}
            <div className="relative z-10 flex items-center gap-3 border-b border-white/20 px-4 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 shadow-inner">
                    <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-white">AI Assistant</h3>
                    <p className="text-xs text-white/60">Always here to help</p>
                </div>
                <div className="ml-auto flex items-center gap-1.5">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                    <span className="text-xs text-white/60">Online</span>
                </div>
            </div>

            {/* Messages */}
            <div className="relative z-10 flex-1 overflow-y-auto px-4 py-3">
                <div className="flex flex-col gap-3">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={cn(
                                "flex gap-2",
                                message.role === "user" ? "flex-row-reverse" : "flex-row"
                            )}
                        >
                            <div
                                className={cn(
                                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                                    message.role === "user"
                                        ? "bg-white/30"
                                        : "bg-white/20"
                                )}
                            >
                                {message.role === "user" ? (
                                    <User className="h-4 w-4 text-white" />
                                ) : (
                                    <Bot className="h-4 w-4 text-white" />
                                )}
                            </div>
                            <div
                                className={cn(
                                    "max-w-[75%] rounded-2xl px-3 py-2 text-sm",
                                    message.role === "user"
                                        ? "bg-white/30 text-white"
                                        : "bg-white/15 text-white/90"
                                )}
                            >
                                {message.content}
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex gap-2">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20">
                                <Bot className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex items-center gap-1 rounded-2xl bg-white/15 px-4 py-2">
                                <span className="h-2 w-2 animate-bounce rounded-full bg-white/60 [animation-delay:0ms]" />
                                <span className="h-2 w-2 animate-bounce rounded-full bg-white/60 [animation-delay:150ms]" />
                                <span className="h-2 w-2 animate-bounce rounded-full bg-white/60 [animation-delay:300ms]" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input */}
            <form
                onSubmit={handleSubmit}
                className="relative z-10 border-t border-white/20 px-3 py-3"
            >
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a message..."
                        className={cn(
                            "flex-1 rounded-xl border border-white/30 bg-white/10 px-4 py-2.5",
                            "text-sm text-white placeholder:text-white/50",
                            "outline-none transition-all duration-200",
                            "focus:border-white/50 focus:bg-white/15"
                        )}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim()}
                        className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-xl",
                            "border border-white/30 bg-white/15 backdrop-blur-sm",
                            "transition-all duration-300",
                            "hover:bg-white/25 hover:border-white/50 hover:scale-105",
                            "active:scale-95 active:bg-white/20",
                            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
                            "shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2px_8px_rgba(0,0,0,0.08)]"
                        )}
                    >
                        <Send className="h-4 w-4 text-white" />
                    </button>
                </div>
            </form>
        </div>
    )
}
