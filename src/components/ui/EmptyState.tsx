'use client';

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import ButtonGradient from './ButtonGradient';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4', className)}>
      {Icon && (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-4">
          <Icon className="h-8 w-8 text-gray-400" />
        </div>
      )}

      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>

      {description && (
        <p className="text-sm text-gray-500 text-center max-w-md mb-6">{description}</p>
      )}

      {actionLabel && onAction && (
        <ButtonGradient onClick={onAction} variant="primary" size="md">
          {actionLabel}
        </ButtonGradient>
      )}
    </div>
  );
}
