'use client';

import { Play, Mic, FileText } from 'lucide-react';
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
}: SidebarProps) {
  return (
    <nav className={cn('flex flex-col h-full', className)}>
      {/* Navigation area */}
      <div className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <SidebarItem
            key={item.step}
            icon={item.icon}
            label={item.label}
            active={currentStep === item.step}
            onClick={() => onNavigate(item.step)}
          />
        ))}
      </div>
    </nav>
  );
}