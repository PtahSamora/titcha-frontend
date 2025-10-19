'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { BookOpen, Upload, TrendingUp, GraduationCap, LogOut } from 'lucide-react';
import Link from 'next/link';
import RoleBadge from '@/components/ui/RoleBadge';
import ButtonGradient from '@/components/ui/ButtonGradient';
import { FriendsBar } from '@/components/student/FriendsBar';
import { DMTray } from '@/components/student/DMTray';
import { GroupsPanel } from '@/components/student/GroupsPanel';
import { useEffect } from 'react';

export default function StudentDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated' || (session && session.user.role !== 'student')) {
      router.push('/login');
    }
  }, [status, session, router]);

  if (status === 'loading' || !session) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const user = session.user;
  const grade = user.meta?.grade || 'Not specified';

  return (
    <div className="min-h-screen bg-gradient-brand">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <h1 className="text-2xl font-bold font-heading bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Titcha
                </h1>
              </Link>
              <RoleBadge role="student" />
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Welcome back,</p>
                <p className="font-semibold text-gray-900">{user.name}</p>
              </div>
              <Link href="/api/auth/signout">
                <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                  <LogOut className="h-5 w-5" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Friends Bar */}
      <FriendsBar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 mb-8 text-white">
          <div className="flex items-center gap-3 mb-2">
            <GraduationCap className="h-8 w-8" />
            <h2 className="text-3xl font-bold">Welcome, {user.name}!</h2>
          </div>
          <p className="text-purple-100 text-lg">Grade: {grade}</p>
          <p className="text-purple-100 mt-2">Ready to continue your learning journey?</p>
        </div>

        {/* Subjects Grid */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Your Subjects</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Mathematics */}
            <Link href="/portal/student/subjects/math">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all hover:scale-105 cursor-pointer">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 bg-purple-600 rounded-xl flex items-center justify-center text-2xl shadow-md">
                    📐
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-gray-900">Mathematics</h4>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">65% Complete</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">
                  Continue learning algebra, geometry, and calculus
                </p>
              </div>
            </Link>

            {/* Science */}
            <Link href="/portal/student/subjects/science">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all hover:scale-105 cursor-pointer">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center text-2xl shadow-md">
                    🔬
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-gray-900">Science</h4>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '42%' }}></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">42% Complete</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">
                  Explore physics, chemistry, and biology
                </p>
              </div>
            </Link>

            {/* English */}
            <Link href="/portal/student/subjects/english">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all hover:scale-105 cursor-pointer">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 bg-green-600 rounded-xl flex items-center justify-center text-2xl shadow-md">
                    📚
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-gray-900">English</h4>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">78% Complete</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">
                  Master literature, writing, and grammar
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Groups Panel */}
        <div className="mb-8">
          <GroupsPanel />
        </div>

        {/* Recent Activity */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h3>
          <div className="text-center py-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-4 mx-auto">
              <BookOpen className="h-8 w-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">No activity yet</h4>
            <p className="text-gray-600 mb-6">Start your first lesson to see your progress here!</p>
            <Link href="/portal/student/homework">
              <ButtonGradient variant="primary" size="md">
                View Homework
              </ButtonGradient>
            </Link>
          </div>
        </div>
      </main>

      {/* DM Tray - Floating chat windows */}
      <DMTray />
    </div>
  );
}
