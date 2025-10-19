'use client';

import { cn } from '@/lib/utils';
import type { Role } from '@/lib/types';
import { GraduationCap, Users, School, Shield, UserCircle } from 'lucide-react';

interface RoleBadgeProps {
  role: Role;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const roleConfig: Record<Role, { icon: any; label: string; colors: string }> = {
  student: {
    icon: GraduationCap,
    label: 'Student',
    colors: 'bg-purple-100 text-purple-700 border-purple-300',
  },
  parent: {
    icon: Users,
    label: 'Parent',
    colors: 'bg-teal-100 text-teal-700 border-teal-300',
  },
  teacher: {
    icon: UserCircle,
    label: 'Teacher',
    colors: 'bg-blue-100 text-blue-700 border-blue-300',
  },
  school: {
    icon: School,
    label: 'School Admin',
    colors: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  },
  admin: {
    icon: Shield,
    label: 'Platform Admin',
    colors: 'bg-gray-100 text-gray-700 border-gray-300',
  },
};

const sizeConfig = {
  sm: 'text-xs px-2 py-1 gap-1',
  md: 'text-sm px-3 py-1.5 gap-1.5',
  lg: 'text-base px-4 py-2 gap-2',
};

const iconSizeConfig = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

export default function RoleBadge({ role, className, size = 'md' }: RoleBadgeProps) {
  const config = roleConfig[role];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border',
        config.colors,
        sizeConfig[size],
        className
      )}
    >
      <Icon className={iconSizeConfig[size]} />
      <span>{config.label}</span>
    </span>
  );
}
