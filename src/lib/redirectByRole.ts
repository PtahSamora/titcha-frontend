import type { Role } from './types';

export function redirectByRole(role: Role | string): string {
  switch (role) {
    case 'student':
      return '/portal/student/dashboard';
    case 'parent':
      return '/portal/parent/dashboard';
    case 'teacher':
      return '/portal/teacher/dashboard';
    case 'school':
      return '/portal/school/dashboard';
    case 'admin':
      return '/portal/admin/dashboard';
    default:
      return '/';
  }
}
