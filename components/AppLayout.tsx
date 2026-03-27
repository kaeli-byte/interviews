'use client';

import { cn } from '@/lib/utils';
import { LiquidGlassSidebar, type NavigationItem } from '@/components/ui/liquid-glass';
import type { AppStep } from '@/components/MyCareerApp';
import { Play, User, Mic, FileText } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
  currentStep: AppStep;
  onNavigate: (step: AppStep) => void;
  disabledSteps?: AppStep[];
  userName?: string;
  userRole?: string;
  userInitials?: string;
}

// Navigation items for MyCareer app
const appNavigationItems: NavigationItem[] = [
  { id: 'setup', name: 'Start Interview', icon: Play, href: '/setup' },
  { id: 'persona', name: 'Candidate Profile', icon: User, href: '/persona' },
  { id: 'interview', name: 'Interview', icon: Mic, href: '/interview' },
  { id: 'debrief', name: 'Results', icon: FileText, href: '/debrief' },
];

export function AppLayout({
  children,
  currentStep,
  onNavigate,
  disabledSteps = [],
  userName = 'User',
  userRole = 'Candidate',
  userInitials = 'U',
}: AppLayoutProps) {
  // Build navigation items with disabled state
  const navigationItems: NavigationItem[] = appNavigationItems.map(item => ({
    ...item,
    disabled: disabledSteps.includes(item.id as AppStep),
  }));

  const handleNavigation = (itemId: string, href: string) => {
    onNavigate(itemId as AppStep);
  };

  return (
    <div className="flex h-screen relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/hero-bg-03.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      {/* Dark gradient overlay for readability */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-black/90 via-black/50 to-black/90" />

      {/* Liquid Glass Sidebar - handles its own mobile responsiveness */}
      <LiquidGlassSidebar
        navigationItems={navigationItems}
        activeItem={currentStep}
        onNavigate={handleNavigation}
        brandName="MyCareer"
        brandSubtitle="AI Interview Coach"
        userName={userName}
        userRole={userRole}
        userInitials={userInitials}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Body container with overflow handling */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}