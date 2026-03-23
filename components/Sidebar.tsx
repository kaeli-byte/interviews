'use client';

import { Play, Mic, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { AppStep } from '@/components/MyCareerApp';

const navItems = [
  { step: 'setup' as const, label: 'Start Interview', icon: Play },
  { step: 'interview' as const, label: 'Interview', icon: Mic },
  { step: 'debrief' as const, label: 'Results', icon: FileText },
] as const;

interface SidebarProps {
  currentStep: AppStep;
  onNavigate: (step: AppStep) => void;
  className?: string;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
}

export function SidebarItem({ icon: Icon, label, active, onClick }: SidebarItemProps) {
  return (
    <Button
      variant="ghost"
      className={cn(
        'w-full justify-start gap-3 px-3',
        active && 'bg-primary/10 text-primary font-medium'
      )}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
    >
      <Icon className="size-4" />
      <span>{label}</span>
    </Button>
  );
}

export function Sidebar({
  currentStep,
  onNavigate,
  className,
  mobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const sidebarContent = (
    <nav className="flex flex-col h-full bg-surface-container-low border-r border-border">
      {/* Navigation area */}
      <div className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <SidebarItem
            key={item.step}
            icon={item.icon}
            label={item.label}
            active={currentStep === item.step}
            onClick={() => {
              onNavigate(item.step);
              if (mobileOpen && onMobileClose) {
                onMobileClose();
              }
            }}
          />
        ))}
      </div>
    </nav>
  );

  // Desktop: render as static sidebar
  if (!mobileOpen && !onMobileClose) {
    return (
      <div className={cn('w-64', className)}>
        {sidebarContent}
      </div>
    );
  }

  // Mobile: render as overlay drawer when open
  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-black/50 z-40 transition-opacity duration-300',
          mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onMobileClose}
        aria-hidden="true"
      />

      {/* Sidebar drawer */}
      <div
        className={cn(
          'fixed left-0 top-0 h-full z-50 w-64 transition-transform duration-300 ease-in-out',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 lg:hidden"
          onClick={onMobileClose}
          aria-label="Close menu"
        >
          <X className="size-4" />
        </Button>

        {sidebarContent}
      </div>
    </>
  );
}