'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { BookOpen, Upload, TrendingUp, GraduationCap, LogOut, Sparkles, X, Home } from 'lucide-react';
import Link from 'next/link';
import RoleBadge from '@/components/ui/RoleBadge';
import ButtonGradient from '@/components/ui/ButtonGradient';
import { FriendsBar } from '@/components/student/FriendsBar';
import { DMTray } from '@/components/student/DMTray';
import { GroupsPanel } from '@/components/student/GroupsPanel';
import { useEffect, useState } from 'react';
import { getZodiacSign, getZodiacEmoji } from '@/lib/zodiac';

interface StudentProfile {
  name: string;
  grade: string;
  dob: string;
  zodiac: string;
  personality: string;
  photo?: string;
  horoscope?: string;
  lastUpdated: string;
}

export default function StudentDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Profile modal state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [grade, setGrade] = useState('');
  const [dob, setDob] = useState('');
  const [personality, setPersonality] = useState('');
  const [photo, setPhoto] = useState('');
  const [profile, setProfile] = useState<StudentProfile | null>(null);

  // Feedback animation state
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [feedbackEmoji, setFeedbackEmoji] = useState<string | null>(null);

  // Load existing profile on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('titcha_student_profile');
      if (stored) {
        try {
          setProfile(JSON.parse(stored));
        } catch (error) {
          console.error('Error loading student profile:', error);
        }
      }
    }
  }, []);

  // Pre-fill modal with existing profile data when opened
  useEffect(() => {
    if (profile && showProfileModal) {
      setGrade(profile.grade || '');
      setDob(profile.dob || '');
      setPersonality(profile.personality || '');
      setPhoto(profile.photo || '');
    }
  }, [showProfileModal, profile]);

  useEffect(() => {
    // Only redirect after session fully resolves
    if (status === 'unauthenticated') {
      router.replace('/login');
    } else if (session && (session.user as any).role?.toUpperCase() !== 'STUDENT') {
      // Redirect to correct portal if wrong role
      const role = ((session.user as any).role as string)?.toLowerCase();
      router.replace(`/portal/${role}/dashboard`);
    }
  }, [status, session, router]);

  // Show loading state until session is ready
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-brand">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect via useEffect
  }

  const user = session.user;
  const userGrade = user.meta?.grade || 'Not specified';
  const studentName = user.name || 'Student';

  // Handle photo upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Fetch horoscope from API
  const fetchWeeklyHoroscope = async (sign: string): Promise<string> => {
    try {
      const res = await fetch(`/api/horoscope?sign=${sign.toLowerCase()}`);
      const data = await res.json();
      return data.description || '';
    } catch (error) {
      console.error('Failed to fetch horoscope:', error);
      return '';
    }
  };

  // Handle profile submission
  const handleProfileSave = async () => {
    if (!grade || !dob || !personality) {
      alert('Please fill in all fields before submitting.');
      return;
    }

    const zodiacSign = getZodiacSign(dob);
    const horoscopeText = await fetchWeeklyHoroscope(zodiacSign);

    // Merge with existing profile data
    const existing = JSON.parse(localStorage.getItem('titcha_student_profile') || '{}');
    const profileData: StudentProfile = {
      ...existing,
      name: studentName,
      grade,
      dob,
      zodiac: zodiacSign,
      personality,
      photo: photo || existing.photo || undefined,
      horoscope: horoscopeText,
      lastUpdated: new Date().toISOString(),
    };

    localStorage.setItem('titcha_student_profile', JSON.stringify(profileData));
    setProfile(profileData);
    setShowProfileModal(false);
    setFeedbackGiven(false); // Reset feedback for new horoscope

    alert(`🎉 Thanks ${studentName}! Your profile has been updated. Your AI tutor will adapt to your style!`);
  };

  // Handle horoscope feedback with animation
  const handleFeedback = (liked: boolean) => {
    setFeedbackGiven(true);
    setFeedbackEmoji(liked ? '👍' : '👎');

    // Animate emoji for 1.5s then disappear
    setTimeout(() => {
      setFeedbackEmoji(null);
    }, 1500);

    const feedbackLog = JSON.parse(localStorage.getItem('titcha_personality_feedback') || '[]');
    feedbackLog.push({
      date: new Date().toISOString(),
      zodiac: profile?.zodiac,
      liked,
    });
    localStorage.setItem('titcha_personality_feedback', JSON.stringify(feedbackLog));
  };

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
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.location.href = 'https://titcha-frontend.vercel.app/'}
                className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
                title="Go to Titcha Home"
              >
                <Home className="h-5 w-5" />
                <span className="hidden sm:inline">Home</span>
              </button>
              <button
                onClick={() => setShowProfileModal(true)}
                className="w-10 h-10 rounded-full overflow-hidden border-2 border-purple-500 hover:opacity-90 transition shadow-md"
                title="Edit Profile"
              >
                {profile?.photo ? (
                  <img src={profile.photo} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="bg-purple-100 flex items-center justify-center h-full w-full text-purple-700 font-bold text-lg">
                    {studentName[0]?.toUpperCase() || '?'}
                  </div>
                )}
              </button>
              <button
                onClick={async () => {
                  try {
                    await signOut({
                      callbackUrl: 'https://titcha-frontend.vercel.app/',
                      redirect: true
                    });
                  } catch (error) {
                    console.error('Logout error:', error);
                    window.location.href = 'https://titcha-frontend.vercel.app/';
                  }
                }}
                className="text-gray-600 hover:text-gray-900 font-medium flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>          </div>
        </div>
      </header>

      {/* Friends Bar */}
      <FriendsBar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 mb-8 text-white shadow-xl">
          <div className="flex items-center gap-3 mb-2">
            <GraduationCap className="h-8 w-8" />
            <h2 className="text-3xl font-bold">Welcome, {profile?.name || user.name}!</h2>
          </div>
          <p className="text-purple-100 text-lg">Grade: {profile?.grade || userGrade}</p>

          {profile?.horoscope ? (
            <div className="mt-4 p-4 bg-gradient-to-r from-purple-50/20 to-indigo-50/20 backdrop-blur-sm border border-white/30 rounded-lg shadow-md">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">✨</span>
                <p className="font-semibold text-white">This week's vibe for you</p>
              </div>

              <p className="text-purple-50 leading-relaxed text-sm mb-3">{profile.horoscope}</p>

              {!feedbackGiven ? (
                <div className="flex justify-center gap-4 mt-3">
                  <button
                    onClick={() => handleFeedback(true)}
                    className="text-white hover:text-green-300 text-xl transition-transform transform hover:scale-125 active:scale-95"
                    title="This resonates with me"
                  >
                    👍
                  </button>
                  <button
                    onClick={() => handleFeedback(false)}
                    className="text-white hover:text-red-300 text-xl transition-transform transform hover:scale-125 active:scale-95"
                    title="Not quite right"
                  >
                    👎
                  </button>
                </div>
              ) : feedbackEmoji ? (
                <div className="flex justify-center mt-3">
                  <span
                    className="text-4xl animate-bounce"
                    style={{ animationDuration: '0.8s' }}
                  >
                    {feedbackEmoji}
                  </span>
                </div>
              ) : (
                <div className="text-center mt-3">
                  <p className="text-purple-100 text-sm italic">Thanks for your feedback! 💫</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-purple-100 mt-2">Ready to continue your learning journey?</p>
          )}
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

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full space-y-6 max-h-[90vh] overflow-y-auto relative">
            {/* Close button */}
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition"
              onClick={() => setShowProfileModal(false)}
            >
              <X className="h-6 w-6" />
            </button>

            {/* Header */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">🌟 Let's Get to Know You!</h2>
              <p className="text-gray-600 text-sm mt-2">
                Personalize your Titcha experience with a few quick questions.
              </p>
            </div>

            {/* Upload Profile Picture */}
            <div className="flex flex-col items-center space-y-3">
              <div className="w-20 h-20 rounded-full border-2 border-purple-500 overflow-hidden shadow-lg">
                {photo ? (
                  <img src={photo} alt="Profile preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="bg-gray-100 w-full h-full flex items-center justify-center text-gray-400 text-3xl">
                    📷
                  </div>
                )}
              </div>
              <label className="cursor-pointer text-purple-600 text-sm font-medium hover:underline">
                Upload Photo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </label>
            </div>

            {/* Grade */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">Which grade are you in?</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="border border-gray-300 rounded-lg w-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              >
                <option value="">Select grade</option>
                {['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'].map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">When is your birthday?</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="border border-gray-300 rounded-lg w-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              />
            </div>

            {/* Personality Style */}
            <div>
              <p className="font-medium text-gray-700 mb-3">Pick what sounds most like you:</p>
              <div className="space-y-3">
                {[
                  { id: 'curious', text: '🔍 I love asking questions and exploring new ideas' },
                  { id: 'creative', text: '🎨 I enjoy creating stories, drawings, or projects' },
                  { id: 'logical', text: '🧠 I like solving problems and figuring out patterns' },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPersonality(p.id)}
                    className={`w-full border rounded-lg py-3 px-4 text-left transition ${
                      personality === p.id
                        ? 'bg-purple-100 border-purple-500 text-purple-900 font-medium'
                        : 'border-gray-300 hover:border-purple-300 hover:bg-purple-50'
                    }`}
                  >
                    {p.text}
                  </button>
                ))}
              </div>
            </div>

            {/* Save */}
            <button
              disabled={!grade || !dob || !personality}
              onClick={handleProfileSave}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white w-full py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg hover:shadow-xl"
            >
              Save My Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
