'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Award, FileText, X } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';

// Mock learner data
const mockLearnerData: Record<string, any> = {
  '1': {
    id: 1,
    name: "Lebo M.",
    school: "Johannesburg High School",
    grade: 7,
    stats: {
      lessons: 12,
      groupLessons: 4,
      quizzes: 6,
      practiceProblems: 24,
    },
    homeworks: [
      {
        id: 1,
        title: "Fractions Mastery",
        subject: "Mathematics",
        difficulty: 4,
        score: 85,
        status: "Graded",
        dueDate: "2025-10-20",
        submittedDate: "2025-10-15",
        aiGrade: 85,
        aiFeedback: "Strong understanding of fraction operations. Minor errors in complex denominators. Recommend additional practice with mixed fractions.",
      },
      {
        id: 2,
        title: "Decimals Challenge",
        subject: "Mathematics",
        difficulty: 5,
        score: 60,
        status: "In Progress",
        dueDate: "2025-10-25",
        submittedDate: "2025-10-18",
        aiGrade: 60,
        aiFeedback: "Currently working on decimal division. Student shows good grasp of basic concepts but requires additional practice with complex division problems.",
      },
      {
        id: 3,
        title: "Essay Writing - Persuasive",
        subject: "English",
        difficulty: 3,
        score: 90,
        status: "Graded",
        dueDate: "2025-10-12",
        submittedDate: "2025-10-10",
        aiGrade: 90,
        aiFeedback: "Excellent use of persuasive language and structure. Clear thesis statement and strong supporting arguments. Minor grammar improvements needed.",
      },
    ],
    performance: {
      mathematics: 85,
      science: 78,
      english: 90,
    },
  },
  // Add more learners if needed
};

export default function ParentLearnerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const learnerId = params.id as string;

  const [showHomeworkModal, setShowHomeworkModal] = useState(false);
  const [selectedHomework, setSelectedHomework] = useState<any>(null);
  const [learners, setLearners] = useState<any[]>([]);

  useEffect(() => {
    // Load learners from localStorage
    const storedLearners = localStorage.getItem('parent_learners');
    if (storedLearners) {
      setLearners(JSON.parse(storedLearners));
    }
  }, []);

  // Get learner data from localStorage or use mock
  const storedLearner = learners.find((l) => l.id === parseInt(learnerId));

  // Default values for missing data
  const defaultData = {
    stats: { lessons: 10, groupLessons: 3, quizzes: 5, practiceProblems: 20 },
    homeworks: [],
    performance: { mathematics: 75, science: 70, english: 80 },
    school: "Unknown School",
  };

  // Merge stored learner with defaults or use mock data
  let learner;
  if (mockLearnerData[learnerId]) {
    learner = mockLearnerData[learnerId];
  } else if (storedLearner) {
    // Convert subjects array to performance object if needed
    const performance: Record<string, number> = {};
    if (storedLearner.subjects && Array.isArray(storedLearner.subjects)) {
      storedLearner.subjects.forEach((subject: any) => {
        performance[subject.name.toLowerCase()] = subject.progress;
      });
    }

    learner = {
      ...defaultData,
      ...storedLearner,
      stats: storedLearner.stats || defaultData.stats,
      homeworks: storedLearner.homeworks || defaultData.homeworks,
      performance: Object.keys(performance).length > 0 ? performance : defaultData.performance,
    };
  } else {
    learner = {
      id: parseInt(learnerId),
      name: `Child ${learnerId}`,
      grade: 7,
      ...defaultData,
    };
  }

  const handleViewHomework = (homework: any) => {
    setSelectedHomework(homework);
    setShowHomeworkModal(true);
  };

  const getStatusColor = (status: string) => {
    return status === 'Graded' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700';
  };

  const getDifficultyColor = (level: number) => {
    if (level <= 2) return 'bg-green-100 text-green-700';
    if (level <= 4) return 'bg-blue-100 text-blue-700';
    return 'bg-orange-100 text-orange-700';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100">
      <nav className="bg-white/80 backdrop-blur-sm border-b border-blue-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-purple-600">Parent Portal</h1>
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/portal/parent/dashboard')}
              className="px-4 py-2 text-gray-700 hover:text-purple-600"
            >
              Dashboard
            </button>
            <button
              onClick={() => router.push('/portal/parent/profile')}
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
          <div className="flex items-start gap-4 mb-6">
            <button
              onClick={() => router.push('/portal/parent/learners')}
              className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors mt-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back to My Kids</span>
            </button>
          </div>

          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {learner.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h2 className="text-4xl font-bold text-gray-900">{learner.name}</h2>
                <p className="text-gray-600">{learner.school}</p>
                <p className="text-sm text-gray-500">Grade {learner.grade}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Performance and Activity Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Learning Stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-purple-500" />
              Learning Activity
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Lessons Attended</p>
                <p className="text-3xl font-bold text-purple-600">{learner.stats.lessons}</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Group Lessons</p>
                <p className="text-3xl font-bold text-blue-600">{learner.stats.groupLessons}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Quizzes Taken</p>
                <p className="text-3xl font-bold text-green-600">{learner.stats.quizzes}</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Practice Problems</p>
                <p className="text-3xl font-bold text-orange-600">{learner.stats.practiceProblems}</p>
              </div>
            </div>
          </motion.div>

          {/* Subject Performance */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="w-6 h-6 text-yellow-500" />
              Subject Performance
            </h3>
            <div className="space-y-4">
              {Object.entries(learner.performance).map(([subject, score]) => (
                <div key={subject}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-gray-700 capitalize">{subject}</span>
                    <span className="text-gray-600">{score}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full transition-all"
                      style={{ width: `${score}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Homework Log */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-500" />
            Homework Log
          </h3>
          {learner.homeworks && learner.homeworks.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-purple-100 to-pink-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Title</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Subject</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Difficulty</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Score</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Due Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {learner.homeworks.map((hw: any) => (
                    <tr key={hw.id} className="hover:bg-purple-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{hw.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{hw.subject}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(hw.difficulty)}`}>
                          Level {hw.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-2xl font-bold text-purple-600">{hw.score}%</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(hw.status)}`}>
                          {hw.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{hw.dueDate}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleViewHomework(hw)}
                          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm rounded-lg hover:shadow-lg transition-all"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No homework submissions yet</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Homework Detail Modal */}
      {showHomeworkModal && selectedHomework && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-white">{selectedHomework.title}</h3>
              <button
                onClick={() => setShowHomeworkModal(false)}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Subject</p>
                  <p className="text-lg font-bold text-gray-900">{selectedHomework.subject}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Difficulty Level</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getDifficultyColor(selectedHomework.difficulty)}`}>
                    Level {selectedHomework.difficulty}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Due Date</p>
                  <p className="text-lg font-bold text-gray-900">{selectedHomework.dueDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Submitted On</p>
                  <p className="text-lg font-bold text-gray-900">{selectedHomework.submittedDate || 'Not submitted'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">AI Grade</p>
                  <p className="text-lg font-bold text-purple-600">{selectedHomework.aiGrade}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(selectedHomework.status)}`}>
                    {selectedHomework.status}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-semibold text-gray-900 mb-2">AI Corrections & Feedback</h4>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-gray-700 leading-relaxed">{selectedHomework.aiFeedback}</p>
                </div>
              </div>

              {selectedHomework.status === 'Graded' && (
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Performance Summary</h4>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Overall Score</span>
                      <span className="text-2xl font-bold text-purple-600">{selectedHomework.aiGrade}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full transition-all"
                        style={{ width: `${selectedHomework.aiGrade}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowHomeworkModal(false)}
                className="px-6 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
