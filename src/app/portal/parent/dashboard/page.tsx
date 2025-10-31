'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Bot, Calendar, TrendingUp, Users, UserCircle, Plus, Home, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Default learners data
const defaultLearners = [
  {
    id: 1,
    name: "Lebo M.",
    grade: 6,
    subjects: [
      { name: "Mathematics", progress: 85 },
      { name: "Science", progress: 72 },
      { name: "English", progress: 90 },
    ],
  },
  {
    id: 2,
    name: "Anele D.",
    grade: 4,
    subjects: [
      { name: "Math", progress: 65 },
      { name: "Life Skills", progress: 80 },
      { name: "English", progress: 77 },
    ],
  },
];

// Default homework data
const defaultHomeworks = [
  {
    id: 101,
    title: "Fractions Mastery",
    learner: "Lebo M.",
    subject: "Mathematics",
    difficulty: 4,
    completion: 60,
    dueDate: "2025-10-25",
    status: "pending",
  },
  {
    id: 102,
    title: "Photosynthesis Basics",
    learner: "Anele D.",
    subject: "Science",
    difficulty: 3,
    completion: 100,
    dueDate: "2025-10-12",
    status: "done",
  },
];

export default function ParentDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const redirected = useRef(false);
  const [learners, setLearners] = useState(defaultLearners);
  const [homeworks, setHomeworks] = useState(defaultHomeworks);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showCreateHomeworkModal, setShowCreateHomeworkModal] = useState(false);
  const [homeworkForm, setHomeworkForm] = useState({
    title: '',
    learner: '',
    subject: '',
    difficulty: '',
    dueDate: '',
  });

  useEffect(() => {
    // Prevent multiple redirects
    if (redirected.current) return;

    // Only redirect after session fully resolves
    if (status === 'unauthenticated') {
      redirected.current = true;
      router.replace('/login');
      return;
    }

    if (status === 'authenticated' && session) {
      const userRole = (session.user as any).role?.toUpperCase();
      if (userRole && userRole !== 'PARENT') {
        redirected.current = true;
        // Redirect to correct portal if wrong role
        const role = userRole.toLowerCase();
        router.replace(`/portal/${role}/dashboard`);
      }
    }
  }, [status, session, router]);

  // Load data from localStorage on mount (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedLearners = localStorage.getItem('parent_learners');
      if (storedLearners) {
        try {
          setLearners(JSON.parse(storedLearners));
        } catch (e) {
          console.error('Error parsing learners:', e);
        }
      }

      const storedHomework = localStorage.getItem('student_homework');
      if (storedHomework) {
        try {
          setHomeworks(JSON.parse(storedHomework));
        } catch (e) {
          console.error('Error parsing homework:', e);
        }
      }
    }
  }, []);

  // Show loading state until session is ready
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100">
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

  // Get user info from session
  const user = {
    title: 'Mrs.',
    name: session.user?.name || 'Parent',
  };

  const handleLogout = async () => {
    try {
      await signOut({
        callbackUrl: 'https://titcha-frontend.vercel.app/',
        redirect: true
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback to manual redirect
      window.location.href = 'https://titcha-frontend.vercel.app/';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100">
      <nav className="bg-white/80 backdrop-blur-sm border-b border-blue-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-purple-600">Parent Portal</h1>
          <div className="flex gap-3">
            <button
              onClick={() => window.location.href = 'https://titcha-frontend.vercel.app/'}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              title="Go to Titcha Home"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Titcha Home</span>
            </button>
            <button
              onClick={() => router.push('/portal/parent/profile')}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              <UserCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex justify-between items-start"
        >
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h2>
            <p className="text-gray-600">Welcome back, {user.title} {user.name} 👋</p>
          </div>
          <button
            onClick={() => router.push('/portal/parent/learners')}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all"
          >
            <UserCircle className="w-5 h-5" />
            My Kids
          </button>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer"
          >
            <TrendingUp className="w-8 h-8 text-green-500 mb-2" />
            <h4 className="font-semibold text-gray-900 mb-1">Overall Progress</h4>
            <p className="text-2xl font-bold text-green-600">78%</p>
            <p className="text-sm text-gray-600">Across all learners</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.05 }}
            className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer"
          >
            <Calendar className="w-8 h-8 text-blue-500 mb-2" />
            <h4 className="font-semibold text-gray-900 mb-1">Pending Tasks</h4>
            <p className="text-2xl font-bold text-blue-600">3</p>
            <p className="text-sm text-gray-600">Homework assignments</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
            className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer"
          >
            <Users className="w-8 h-8 text-purple-500 mb-2" />
            <h4 className="font-semibold text-gray-900 mb-1">Active Learners</h4>
            <p className="text-2xl font-bold text-purple-600">{learners.length}</p>
            <p className="text-sm text-gray-600">Currently enrolled</p>
          </motion.div>
        </div>

        {/* Homework Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-500" />
              Recent Homework
            </h3>
            <button
              onClick={() => setShowCreateHomeworkModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              Create Homework
            </button>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden">
            {/* Table Header */}
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 px-6 py-3 grid grid-cols-7 gap-4 text-sm font-semibold text-gray-700">
              <div className="col-span-2">Title</div>
              <div>Learner</div>
              <div>Subject</div>
              <div>Difficulty</div>
              <div>Status</div>
              <div>Completion</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {homeworks.map((hw) => (
                <div
                  key={hw.id}
                  className="px-6 py-4 grid grid-cols-7 gap-4 items-center hover:bg-purple-50 transition-colors"
                >
                  <div className="col-span-2">
                    <div className="font-medium text-gray-900">{hw.title}</div>
                    <div className="text-xs text-gray-500">Due: {hw.dueDate}</div>
                  </div>
                  <div className="text-sm text-gray-700">{hw.learner}</div>
                  <div className="text-sm text-gray-700">{hw.subject}</div>
                  <div className="text-sm">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                      Lvl {hw.difficulty}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        hw.status === 'done' || hw.status === 'Graded'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {hw.status === 'done' ? 'Completed' : hw.status === 'pending' ? 'Pending' : hw.status}
                    </span>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">{hw.completion}%</div>
                    <div className="w-20 bg-gray-200 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${
                          hw.completion === 100 ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${hw.completion}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating AI Assistant Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowAIModal(true)}
        className="fixed bottom-8 right-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl z-50 flex items-center gap-2"
      >
        <Bot className="w-6 h-6" />
        <span className="font-medium pr-2">Ask AI about my child's progress</span>
      </motion.button>

      {/* AI Assistant Modal */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8"
          >
            <div className="text-center">
              <Bot className="w-16 h-16 text-purple-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">AI Assistant</h3>
              <p className="text-gray-600 mb-6">
                Our AI assistant is coming soon! You'll be able to ask questions about your
                child's progress, homework, and learning journey.
              </p>
              <button
                onClick={() => setShowAIModal(false)}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all"
              >
                Got it!
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Create Homework Modal */}
      {showCreateHomeworkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <Plus className="w-6 h-6" />
                Create New Homework
              </h3>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Title */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Homework Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Algebra Practice - Chapter 5"
                    value={homeworkForm.title}
                    onChange={(e) => setHomeworkForm({ ...homeworkForm, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                {/* Learner */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assign to Learner
                  </label>
                  <select
                    value={homeworkForm.learner}
                    onChange={(e) => setHomeworkForm({ ...homeworkForm, learner: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="">Select Learner</option>
                    {learners.map((learner) => (
                      <option key={learner.id} value={learner.name}>
                        {learner.name} (Grade {learner.grade})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <select
                    value={homeworkForm.subject}
                    onChange={(e) => setHomeworkForm({ ...homeworkForm, subject: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="">Select Subject</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">Science</option>
                    <option value="English">English</option>
                    <option value="Life Skills">Life Skills</option>
                    <option value="History">History</option>
                  </select>
                </div>

                {/* Difficulty */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty Level
                  </label>
                  <select
                    value={homeworkForm.difficulty}
                    onChange={(e) => setHomeworkForm({ ...homeworkForm, difficulty: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="">Select Difficulty</option>
                    <option value="1">Level 1 - Easy</option>
                    <option value="2">Level 2 - Medium</option>
                    <option value="3">Level 3 - Moderate</option>
                    <option value="4">Level 4 - Challenging</option>
                    <option value="5">Level 5 - Advanced</option>
                  </select>
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={homeworkForm.dueDate}
                    onChange={(e) => setHomeworkForm({ ...homeworkForm, dueDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCreateHomeworkModal(false);
                  setHomeworkForm({ title: '', learner: '', subject: '', difficulty: '', dueDate: '' });
                }}
                className="px-6 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!homeworkForm.title || !homeworkForm.learner || !homeworkForm.subject || !homeworkForm.difficulty || !homeworkForm.dueDate) {
                    alert('Please fill in all fields');
                    return;
                  }

                  // Create homework object
                  const newHomework = {
                    id: `hw-${Date.now()}`,
                    title: homeworkForm.title,
                    learner: homeworkForm.learner,
                    subject: homeworkForm.subject,
                    difficulty: parseInt(homeworkForm.difficulty),
                    dueDate: homeworkForm.dueDate,
                    status: 'pending' as const,
                    completion: 0,
                    createdAt: new Date().toISOString(),
                  };

                  // Save to localStorage (client-side only)
                  if (typeof window !== 'undefined') {
                    try {
                      const existingHomework = localStorage.getItem('student_homework');
                      const homeworkList = existingHomework ? JSON.parse(existingHomework) : [];
                      homeworkList.push(newHomework);
                      localStorage.setItem('student_homework', JSON.stringify(homeworkList));

                      // Update state to refresh the UI
                      setHomeworks(homeworkList);

                      console.log('Created homework:', newHomework);
                      alert(`Homework "${newHomework.title}" created for ${newHomework.learner}`);
                    } catch (e) {
                      console.error('Error saving homework:', e);
                      alert('Error saving homework. Please try again.');
                    }
                  }

                  setShowCreateHomeworkModal(false);
                  setHomeworkForm({ title: '', learner: '', subject: '', difficulty: '', dueDate: '' });
                }}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all"
              >
                Create Homework
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
