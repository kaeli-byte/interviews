"use client"

import { LiquidGlassSidebar, type NavigationItem } from "@/components/ui/liquid-glass"
import { Briefcase, MessageSquare, Mic } from "lucide-react"

// Custom navigation items for the MyCareer app
const careerNavigationItems: NavigationItem[] = [
    { id: "dashboard", name: "Dashboard", icon: Briefcase, href: "/dashboard" },
    { id: "interview", name: "Interview", icon: Mic, href: "/interview" },
    { id: "messages", name: "Messages", icon: MessageSquare, href: "/messages", badge: "5" },
]

export function DemoSidebar() {
    return (
        <div className="flex h-screen w-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900">
            <LiquidGlassSidebar
                navigationItems={careerNavigationItems}
                brandName="MyCareer"
                brandSubtitle="AI Interview Coach"
                userName="Jane Smith"
                userRole="Software Engineer"
                userInitials="JS"
                onNavigate={(itemId, href) => {
                    console.log(`Navigating to ${href} (item: ${itemId})`)
                }}
            />

            {/* Main content area */}
            <main className="flex-1 p-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-white mb-4">Welcome to MyCareer</h1>
                    <p className="text-white/70">
                        This is a demo of the Liquid Glass Sidebar integrated with your design system.
                        The sidebar adapts the same glass morphism styling as your other components.
                    </p>
                </div>
            </main>
        </div>
    )
}

// Simple demo with default navigation
export function DemoSidebarDefault() {
    return (
        <div className="flex h-screen w-screen bg-gradient-to-br from-slate-800 via-purple-900 to-slate-900">
            <LiquidGlassSidebar />
        </div>
    )
}