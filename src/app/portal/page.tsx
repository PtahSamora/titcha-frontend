import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function PortalPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  // Get user role and redirect to appropriate dashboard
  const role = (session.user as any).role?.toLowerCase();

  switch (role) {
    case 'student':
      redirect('/portal/student/dashboard');
    case 'parent':
      redirect('/portal/parent/dashboard');
    case 'teacher':
      redirect('/portal/teacher/dashboard');
    case 'school':
      redirect('/portal/school/dashboard');
    default:
      redirect('/');
  }
}
