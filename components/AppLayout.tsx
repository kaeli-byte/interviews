'use client';

import { cn } from '@/lib/utils';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AppLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  mobileMenuOpen: boolean;
  onMobileMenuToggle: () => void;
}

export function AppLayout({
  children,
  sidebar,
  header,
  footer,
  mobileMenuOpen,
  onMobileMenuToggle,
}: AppLayoutProps) {
  return (
    <div className="flex h-screen bg-surface-container-lowest">
      {/* Desktop sidebar - visible at lg breakpoint and up */}
      <div className="hidden lg:block w-64 shrink-0">
        {sidebar}
      </div>

      {/* Mobile sidebar - rendered by parent as overlay drawer */}
      {/* Mobile sidebar toggle button - visible below lg breakpoint */}
      <div className="lg:hidden fixed top-4 left-4 z-30">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMobileMenuToggle}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileMenuOpen}
        >
          <Menu className="size-5" />
        </Button>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header slot (optional) */}
        {header && (
          <div className="shrink-0">
            {header}
          </div>
        )}

        {/* Body container with overflow handling */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>

        {/* Footer slot (optional) */}
        {footer && (
          <div className="shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}