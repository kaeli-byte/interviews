"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import {
    Home,
    User,
    Settings,
    LogOut,
    Menu,
    X,
    ChevronLeft,
    ChevronRight,
    BarChart3,
    FileText,
    Bell,
    Search,
    HelpCircle,
    type LucideIcon,
} from "lucide-react"

export interface NavigationItem {
    id: string
    name: string
    icon: LucideIcon
    href: string
    badge?: string
    disabled?: boolean
}

interface LiquidGlassSidebarProps {
    className?: string
    navigationItems?: NavigationItem[]
    activeItem?: string
    onNavigate?: (itemId: string, href: string) => void
    userName?: string
    userRole?: string
    userInitials?: string
    brandName?: string
    brandSubtitle?: string
}

const defaultNavigationItems: NavigationItem[] = [
    { id: "dashboard", name: "Dashboard", icon: Home, href: "/dashboard" },
    { id: "analytics", name: "Analytics", icon: BarChart3, href: "/analytics" },
    { id: "documents", name: "Documents", icon: FileText, href: "/documents", badge: "3" },
    { id: "notifications", name: "Notifications", icon: Bell, href: "/notifications", badge: "12" },
    { id: "profile", name: "Profile", icon: User, href: "/profile" },
    { id: "settings", name: "Settings", icon: Settings, href: "/settings" },
    { id: "help", name: "Help & Support", icon: HelpCircle, href: "/help" },
]

export function LiquidGlassSidebar({
    className,
    navigationItems = defaultNavigationItems,
    activeItem: controlledActiveItem,
    onNavigate,
    userName = "John Doe",
    userRole = "Senior Administrator",
    userInitials = "JD",
    brandName = "Acme Corp",
    brandSubtitle = "Enterprise Dashboard",
}: LiquidGlassSidebarProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [internalActiveItem, setInternalActiveItem] = useState("dashboard")

    const activeItem = controlledActiveItem ?? internalActiveItem

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsOpen(true)
            } else {
                setIsOpen(false)
            }
        }

        handleResize()
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    const toggleSidebar = () => setIsOpen(!isOpen)
    const toggleCollapse = () => setIsCollapsed(!isCollapsed)

    const handleItemClick = (itemId: string, href: string) => {
        setInternalActiveItem(itemId)
        onNavigate?.(itemId, href)
        if (window.innerWidth < 768) {
            setIsOpen(false)
        }
    }

    return (
        <>
            {/* Mobile hamburger button */}
            <button
                onClick={toggleSidebar}
                className={cn(
                    "fixed top-6 left-6 z-50 p-3 rounded-xl border border-white/30",
                    "bg-white/15 backdrop-blur-xl backdrop-saturate-150",
                    "shadow-[0_4px_16px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.4)]",
                    "md:hidden transition-all duration-300",
                    "hover:bg-white/25 hover:border-white/50 hover:scale-105",
                    "active:scale-95 active:bg-white/20"
                )}
                aria-label="Toggle sidebar"
            >
                {isOpen ? (
                    <X className="h-5 w-5 text-white" />
                ) : (
                    <Menu className="h-5 w-5 text-white" />
                )}
            </button>

            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar */}
            <div
                className={cn(
                    // Base glass container
                    "fixed top-0 left-0 h-full z-40 transition-all duration-300 ease-in-out flex flex-col",
                    "rounded-r-2xl border-r border-t-0 border-b-0 border-l-0 border-white/40",
                    "bg-white/10 backdrop-blur-xl backdrop-saturate-150",
                    // Complex shadow system for depth
                    "shadow-[8px_0_32px_rgba(0,0,0,0.15),inset_1px_0_0_rgba(255,255,255,0.6),inset_-1px_0_0_rgba(255,255,255,0.1)]",
                    // Top highlight gradient
                    "before:pointer-events-none before:absolute before:inset-0 before:rounded-r-2xl",
                    "before:bg-gradient-to-b before:from-white/50 before:via-white/10 before:to-transparent",
                    // Subtle edge glow
                    "after:pointer-events-none after:absolute after:inset-0 after:rounded-r-2xl",
                    "after:bg-gradient-to-tr after:from-white/20 after:via-transparent after:to-white/10",
                    // Responsive and collapsed states
                    isOpen ? "translate-x-0" : "-translate-x-full",
                    isCollapsed ? "w-24" : "w-72",
                    "md:translate-x-0 md:static md:z-auto",
                    className
                )}
            >
                {/* Header with logo and collapse button */}
                <div className="relative z-10 flex items-center justify-between p-4 border-b border-white/20">
                    {!isCollapsed && (
                        <div className="flex items-center gap-3">
                            <div
                                className={cn(
                                    "w-10 h-10 rounded-xl border border-white/40",
                                    "bg-white/25 backdrop-blur-sm",
                                    "flex items-center justify-center",
                                    "shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_4px_12px_rgba(0,0,0,0.15)]"
                                )}
                            >
                                <span className="text-white font-bold text-lg">{brandName[0]}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-semibold text-white text-sm">{brandName}</span>
                                <span className="text-xs text-white/60">{brandSubtitle}</span>
                            </div>
                        </div>
                    )}

                    {isCollapsed && (
                        <div
                            className={cn(
                                "w-10 h-10 rounded-xl border border-white/40 mx-auto",
                                "bg-white/25 backdrop-blur-sm",
                                "flex items-center justify-center",
                                "shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_4px_12px_rgba(0,0,0,0.15)]"
                            )}
                        >
                            <span className="text-white font-bold text-lg">{brandName[0]}</span>
                        </div>
                    )}

                    {/* Desktop collapse button */}
                    <button
                        onClick={toggleCollapse}
                        className={cn(
                            "hidden md:flex p-2 rounded-lg border border-white/20",
                            "bg-white/10 backdrop-blur-sm",
                            "transition-all duration-300",
                            "hover:bg-white/20 hover:border-white/40 hover:scale-105",
                            "active:scale-95",
                            isCollapsed && "mx-auto mt-2"
                        )}
                        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {isCollapsed ? (
                            <ChevronRight className="h-4 w-4 text-white/80" />
                        ) : (
                            <ChevronLeft className="h-4 w-4 text-white/80" />
                        )}
                    </button>
                </div>

                {/* Search Bar */}
                {!isCollapsed && (
                    <div className="relative z-10 px-4 py-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className={cn(
                                    "w-full pl-10 pr-4 py-2.5 rounded-xl",
                                    "border border-white/30 bg-white/10 backdrop-blur-sm",
                                    "text-sm text-white placeholder:text-white/50",
                                    "outline-none transition-all duration-200",
                                    "focus:border-white/50 focus:bg-white/15",
                                    "shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_2px_8px_rgba(0,0,0,0.08)]"
                                )}
                            />
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <nav className="relative z-10 flex-1 px-3 py-2 overflow-y-auto">
                    <ul className="space-y-1">
                        {navigationItems.map((item) => {
                            const Icon = item.icon
                            const isActive = activeItem === item.id
                            const isDisabled = item.disabled

                            return (
                                <li key={item.id} className="relative">
                                    <button
                                        onClick={() => !isDisabled && handleItemClick(item.id, item.href)}
                                        disabled={isDisabled}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left",
                                            "transition-all duration-300 group relative",
                                            isCollapsed && "justify-center px-2",
                                            isDisabled && "opacity-40 cursor-not-allowed pointer-events-none",
                                            !isDisabled && isActive
                                                ? cn(
                                                      "bg-white/25 border border-white/40",
                                                      "shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_4px_12px_rgba(0,0,0,0.15)]",
                                                      "text-white"
                                                  )
                                                : !isDisabled && cn(
                                                      "text-white/70 hover:text-white",
                                                      "hover:bg-white/15 hover:border-white/30"
                                                  ),
                                            !isDisabled && "border border-transparent"
                                        )}
                                        title={isCollapsed ? item.name : undefined}
                                    >
                                        <div
                                            className={cn(
                                                "flex items-center justify-center min-w-[24px] transition-transform duration-300",
                                                !isActive && !isDisabled && "group-hover:scale-110"
                                            )}
                                        >
                                            <Icon
                                                className={cn(
                                                    "h-5 w-5 flex-shrink-0",
                                                    isActive && !isDisabled ? "text-white" : "text-white/60 group-hover:text-white/90"
                                                )}
                                            />
                                        </div>

                                        {!isCollapsed && (
                                            <div className="flex items-center justify-between w-full">
                                                <span
                                                    className={cn(
                                                        "text-sm transition-all duration-200",
                                                        isActive ? "font-semibold" : "font-normal"
                                                    )}
                                                >
                                                    {item.name}
                                                </span>
                                                {item.badge && (
                                                    <span
                                                        className={cn(
                                                            "px-2 py-0.5 text-xs font-medium rounded-full",
                                                            "bg-white/20 text-white border border-white/30",
                                                            "shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]"
                                                        )}
                                                    >
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {/* Badge for collapsed state */}
                                        {isCollapsed && item.badge && (
                                            <div
                                                className={cn(
                                                    "absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center rounded-full",
                                                    "bg-white/25 text-white text-[10px] font-medium",
                                                    "border border-white/40",
                                                    "shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
                                                )}
                                            >
                                                {parseInt(item.badge) > 9 ? "9+" : item.badge}
                                            </div>
                                        )}

                                        {/* Tooltip for collapsed state */}
                                        {isCollapsed && (
                                            <div
                                                className={cn(
                                                    "absolute left-full ml-3 px-3 py-2 rounded-xl",
                                                    "bg-white/20 backdrop-blur-xl border border-white/30",
                                                    "text-white text-sm whitespace-nowrap z-50",
                                                    "shadow-[0_8px_32px_rgba(0,0,0,0.2)]",
                                                    "opacity-0 invisible group-hover:opacity-100 group-hover:visible",
                                                    "transition-all duration-200"
                                                )}
                                            >
                                                {item.name}
                                                {item.badge && (
                                                    <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                                                        {item.badge}
                                                    </span>
                                                )}
                                                <div
                                                    className={cn(
                                                        "absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1",
                                                        "w-2 h-2 bg-white/20 border-l border-b border-white/30",
                                                        "rotate-45"
                                                    )}
                                                />
                                            </div>
                                        )}
                                    </button>
                                </li>
                            )
                        })}
                    </ul>
                </nav>

                {/* Bottom section with profile and logout */}
                <div className="relative z-10 mt-auto border-t border-white/20">
                    {/* Profile Section */}
                    <div className={cn("border-b border-white/10", isCollapsed ? "py-3 px-2" : "p-3")}>
                        {!isCollapsed ? (
                            <div
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-xl",
                                    "bg-white/10 border border-white/20",
                                    "hover:bg-white/15 transition-all duration-200 cursor-pointer"
                                )}
                            >
                                <div
                                    className={cn(
                                        "w-9 h-9 rounded-full border border-white/30",
                                        "bg-white/20 flex items-center justify-center",
                                        "shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]"
                                    )}
                                >
                                    <span className="text-white font-medium text-sm">{userInitials}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">{userName}</p>
                                    <p className="text-xs text-white/60 truncate">{userRole}</p>
                                </div>
                                <div
                                    className={cn(
                                        "w-2.5 h-2.5 rounded-full",
                                        "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"
                                    )}
                                    title="Online"
                                />
                            </div>
                        ) : (
                            <div className="flex justify-center">
                                <div className="relative">
                                    <div
                                        className={cn(
                                            "w-10 h-10 rounded-full border border-white/30",
                                            "bg-white/20 flex items-center justify-center",
                                            "shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]"
                                        )}
                                    >
                                        <span className="text-white font-medium text-sm">{userInitials}</span>
                                    </div>
                                    <div
                                        className={cn(
                                            "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full",
                                            "bg-emerald-400 border-2 border-white/20",
                                            "shadow-[0_0_8px_rgba(52,211,153,0.6)]"
                                        )}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Logout Button */}
                    <div className="p-3">
                        <button
                            onClick={() => handleItemClick("logout", "/logout")}
                            className={cn(
                                "w-full flex items-center rounded-xl text-left transition-all duration-300 group",
                                "text-red-300 hover:text-red-200",
                                "hover:bg-red-500/20 border border-transparent hover:border-red-400/30",
                                isCollapsed ? "justify-center p-3" : "gap-3 px-3 py-3"
                            )}
                            title={isCollapsed ? "Logout" : undefined}
                        >
                            <div className="flex items-center justify-center min-w-[24px]">
                                <LogOut
                                    className={cn(
                                        "h-5 w-5 flex-shrink-0",
                                        "text-red-400 group-hover:text-red-300",
                                        "transition-transform duration-300 group-hover:translate-x-0.5"
                                    )}
                                />
                            </div>

                            {!isCollapsed && <span className="text-sm font-medium">Logout</span>}

                            {/* Tooltip for collapsed state */}
                            {isCollapsed && (
                                <div
                                    className={cn(
                                        "absolute left-full ml-3 px-3 py-2 rounded-xl",
                                        "bg-white/20 backdrop-blur-xl border border-white/30",
                                        "text-red-300 text-sm whitespace-nowrap z-50",
                                        "shadow-[0_8px_32px_rgba(0,0,0,0.2)]",
                                        "opacity-0 invisible group-hover:opacity-100 group-hover:visible",
                                        "transition-all duration-200"
                                    )}
                                >
                                    Logout
                                    <div
                                        className={cn(
                                            "absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1",
                                            "w-2 h-2 bg-white/20 border-l border-b border-white/30",
                                            "rotate-45"
                                        )}
                                    />
                                </div>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area spacer */}
            <div
                className={cn(
                    "transition-all duration-300 ease-in-out",
                    isCollapsed ? "md:ml-24" : "md:ml-72"
                )}
            />
        </>
    )
}