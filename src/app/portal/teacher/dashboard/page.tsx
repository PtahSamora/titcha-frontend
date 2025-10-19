'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, FileText, ClipboardList, TrendingUp, BookOpen, Upload, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Mock teacher data by grade
const mockTeacherDataByGrade: Record<string, any> = {
  '7': {
    grade: "Grade 7",
    learners: 18,
    uploads: 5,
    avgPerformance: 76,
    activeHomeworks: 12,
    topPerformers: [
      { name: 'Lebo M.', score: 95, subject: 'Mathematics' },
      { name: 'Thabo K.', score: 92, subject: 'Science' },
      { name: 'Anele D.', score: 88, subject: 'English' },
    ],
  },
  '8': {
    grade: "Grade 8",
    learners: 22,
    uploads: 7,
    avgPerformance: 81,
    activeHomeworks: 15,
    topPerformers: [
      { name: 'Sipho N.', score: 93, subject: 'Mathematics' },
      { name: 'Nomsa P.', score: 89, subject: 'English' },
      { name: 'Thembi L.', score: 87, subject: 'Science' },
    ],
  },
  '9': {
    grade: "Grade 9",
    learners: 20,
    uploads: 6,
    avgPerformance: 78,
    activeHomeworks: 10,
    topPerformers: [
      { name: 'Kabelo M.', score: 91, subject: 'Physical Sciences' },
      { name: 'Zanele D.', score: 88, subject: 'Mathematics' },
      { name: 'Bongani K.', score: 85, subject: 'English' },
    ],
  },
  '10': {
    grade: "Grade 10",
    learners: 16,
    uploads: 8,
    avgPerformance: 73,
    activeHomeworks: 14,
    topPerformers: [
      { name: 'Mpho S.', score: 90, subject: 'Mathematics' },
      { name: 'Lesedi T.', score: 86, subject: 'Life Sciences' },
      { name: 'Tshepo M.', score: 84, subject: 'English' },
    ],
  },
  '11': {
    grade: "Grade 11",
    learners: 14,
    uploads: 9,
    avgPerformance: 70,
    activeHomeworks: 11,
    topPerformers: [
      { name: 'Nandi K.', score: 89, subject: 'Mathematics' },
      { name: 'Thandi M.', score: 85, subject: 'Physical Sciences' },
      { name: 'Jabu S.', score: 82, subject: 'Accounting' },
    ],
  },
  '12': {
    grade: "Grade 12",
    learners: 12,
    uploads: 10,
    avgPerformance: 68,
    activeHomeworks: 8,
    topPerformers: [
      { name: 'Senzo D.', score: 88, subject: 'Mathematics' },
      { name: 'Precious L.', score: 84, subject: 'Life Sciences' },
      { name: 'Mandla N.', score: 81, subject: 'English' },
    ],
  },
};

const teacherName = "Mr. Nkosi";

export default function TeacherDashboard() {
  const router = useRouter();
  const [selectedGrade, setSelectedGrade] = useState('7');

  // Get data for selected grade
  const currentData = mockTeacherDataByGrade[selectedGrade];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100">
      <nav className="bg-white/80 backdrop-blur-sm border-b border-blue-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-purple-600">Teacher Portal</h1>
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/portal/teacher/classes')}
              className="px-4 py-2 text-gray-700 hover:text-purple-600"
            >
              My Classes
            </button>
            <button
              onClick={() => router.push('/portal/teacher/profile')}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
            >
              Profile
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h2>
              <p className="text-gray-600">Welcome back, {teacherName}! 👋</p>
            </div>

            {/* Grade Selector */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Teaching:</label>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white"
              >
                {[7, 8, 9, 10, 11, 12].map((grade) => (
                  <option key={grade} value={grade.toString()}>
                    Grade {grade}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className="text-sm text-gray-500">Currently viewing: {currentData.grade}</p>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer"
          >
            <Users className="w-8 h-8 text-purple-500 mb-2" />
            <h4 className="font-semibold text-gray-900 mb-1">Learners</h4>
            <p className="text-3xl font-bold text-purple-600">{currentData.learners}</p>
            <p className="text-sm text-gray-600">Enrolled in {currentData.grade}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.05 }}
            className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer"
          >
            <FileText className="w-8 h-8 text-blue-500 mb-2" />
            <h4 className="font-semibold text-gray-900 mb-1">Uploaded Files</h4>
            <p className="text-3xl font-bold text-blue-600">{currentData.uploads}</p>
            <p className="text-sm text-gray-600">Resources & materials</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
            className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer"
          >
            <ClipboardList className="w-8 h-8 text-orange-500 mb-2" />
            <h4 className="font-semibold text-gray-900 mb-1">Active Homeworks</h4>
            <p className="text-3xl font-bold text-orange-600">{currentData.activeHomeworks}</p>
            <p className="text-sm text-gray-600">Assignments in progress</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.05 }}
            className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer"
          >
            <TrendingUp className="w-8 h-8 text-green-500 mb-2" />
            <h4 className="font-semibold text-gray-900 mb-1">Avg Performance</h4>
            <p className="text-3xl font-bold text-green-600">{currentData.avgPerformance}%</p>
            <p className="text-sm text-gray-600">Class average score</p>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-purple-500" />
              Quick Access
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/portal/teacher/classes')}
                className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
              >
                <span className="font-medium">Go to My Class</span>
                <BookOpen className="w-5 h-5" />
              </button>
              <button
                onClick={() => router.push('/portal/teacher/classes')}
                className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium">Upload Resources</span>
                <Upload className="w-5 h-5" />
              </button>
              <button
                onClick={() => router.push('/portal/teacher/profile')}
                className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium">Settings</span>
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-green-500" />
              Recent Activity
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-700">Lebo M. completed homework</span>
                <span className="text-gray-500">2h ago</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-700">Uploaded new syllabus</span>
                <span className="text-gray-500">1d ago</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-700">Anele D. joined group lesson</span>
                <span className="text-gray-500">2d ago</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-700">Created new assignment</span>
                <span className="text-gray-500">3d ago</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Top Learners */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4">Top Performers This Week - {currentData.grade}</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {currentData.topPerformers.map((learner: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-purple-50 transition-colors cursor-pointer"
                onClick={() => router.push(`/portal/teacher/learners/${idx + 1}`)}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                  idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-gray-400' : 'bg-orange-600'
                }`}>
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{learner.name}</p>
                  <p className="text-xs text-gray-500">{learner.subject}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-purple-600">{learner.score}%</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
