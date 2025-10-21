import type { Role } from './types';

export function redirectByRole(role: Role | string): string {
  // Normalize role to uppercase for consistent matching
  const normalizedRole = role?.toUpperCase();

  switch (normalizedRole) {
    case 'STUDENT':
      return '/portal/student/dashboard';
    case 'PARENT':
      return '/portal/parent/dashboard';
    case 'TEACHER':
      return '/portal/teacher/dashboard';
    case 'SCHOOL':
      return '/portal/school/dashboard';
    case 'ADMIN':
      return '/portal/admin/dashboard';
    default:
      return '/';
  }
}
