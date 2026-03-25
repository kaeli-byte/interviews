'use client';

import { cn } from '@/lib/utils';
import { Menu, X } from 'lucide-react';
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
    <div className="flex h-screen relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/hero-bg-01.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      {/* Dark gradient overlay for readability */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-black/0 via-black/0 to-black/0" />

      {/* Desktop sidebar - visible at lg breakpoint and up */}
      <div className="hidden lg:block w-64 shrink-0 z-10 glass-panel border-r border-white/10">
        {sidebar}
      </div>

      {/* Mobile sidebar overlay */}
      <>
        {/* Backdrop */}
        <div
          className={cn(
            'fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 lg:hidden',
            mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          )}
          onClick={onMobileMenuToggle}
          aria-hidden="true"
        />

        {/* Mobile sidebar drawer */}
        <div
          className={cn(
            'fixed left-0 top-0 h-full z-50 w-64 transition-transform duration-300 ease-in-out lg:hidden glass-panel border-r border-white/10',
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4"
            onClick={onMobileMenuToggle}
            aria-label="Close menu"
          >
            <X className="size-4" />
          </Button>

          {sidebar}
        </div>
      </>

      {/* Mobile menu toggle button */}
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
      <div className="flex-1 flex flex-col min-w-0 z-10">
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