'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Trash2, Clock } from 'lucide-react';
import { useActiveLessons, formatTimeAgo, clearAllLessons } from '@/hooks/useActiveLessons';

const subjectData: Record<string, { name: string; icon: string; color: string }> = {
  math: { name: 'Mathematics', icon: '📐', color: '#9333EA' },
  science: { name: 'Science', icon: '🔬', color: '#3B82F6' },
  english: { name: 'English', icon: '📚', color: '#10B981' },
};

export default function SubjectPage() {
  const router = useRouter();
  const params = useParams();
  const subjectId = params.subject as string;
  const subject = subjectData[subjectId] || subjectData.math;

  const [topicInput, setTopicInput] = useState('');
  const { lessons, refresh } = useActiveLessons();

  // Filter lessons for current subject
  const activeLessons = lessons.filter(lesson => lesson.url.includes(`/subjects/${subjectId}/`));

  // Refresh when component mounts
  useEffect(() => {
    refresh();
  }, []);

  const handleClearAllLessons = () => {
    if (confirm('Clear all active lessons? Your progress will be saved.')) {
      clearAllLessons();
      refresh();
    }
  };

  const modes = [
    {
      id: 'lesson',
      title: 'Start a Lesson',
      description: 'Learn new topics with AI tutor',
      icon: '🎓',
      color: 'bg-blue-500',
    },
    {
      id: 'practice',
      title: 'Practice Problems',
      description: 'Solve problems and get instant feedback',
      icon: '✍️',
      color: 'bg-green-500',
    },
    {
      id: 'checkpoint',
      title: 'Take a Quiz',
      description: 'Test your knowledge with MCQs',
      icon: '✅',
      color: 'bg-purple-500',
    },
  ];

  const handleStartLesson = () => {
    if (!topicInput.trim()) return;
    router.push(`/portal/student/subjects/${subjectId}/lesson?topic=${encodeURIComponent(topicInput)}`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => router.push('/portal/student/dashboard')}
            className="mb-4 text-gray-600 hover:text-gray-900 flex items-center gap-2 transition-colors"
          >
            ← Back to Dashboard
          </button>
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg"
              style={{ backgroundColor: subject.color }}
            >
              {subject.icon}
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">{subject.name}</h1>
              <p className="text-gray-600 mt-1">Choose how you want to learn today</p>
            </div>
          </div>
        </motion.div>

        {/* Topic Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <label className="block text-lg font-semibold text-gray-900 mb-3">
            What would you like to learn about?
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleStartLesson()}
              placeholder="e.g., Quadratic equations, Photosynthesis, Shakespeare..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
            />
            <button
              onClick={handleStartLesson}
              disabled={!topicInput.trim()}
              className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start
            </button>
          </div>
        </motion.div>

        {/* Active Lessons */}
        {activeLessons.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6 mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-600" />
                Active Lessons
              </h2>
              <button
                onClick={handleClearAllLessons}
                className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 transition-colors"
                title="Clear all active lessons"
              >
                <Trash2 className="h-3 w-3" />
                End All
              </button>
            </div>

            <div className="flex gap-3 overflow-x-auto py-2" style={{ scrollbarWidth: 'thin' }}>
              {activeLessons.map((lesson) => (
                <motion.div
                  key={lesson.url}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push(lesson.url)}
                  className="flex-shrink-0 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl px-4 py-3 hover:shadow-md cursor-pointer transition-all min-w-[200px]"
                >
                  <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">
                    {lesson.topic}
                  </h3>
                  <p className="text-xs text-gray-600 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTimeAgo(lesson.lastAccessed)}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Learning Modes */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-3 gap-6"
        >
          {modes.map((mode) => (
            <motion.div
              key={mode.id}
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (mode.id === 'lesson' && topicInput.trim()) {
                  handleStartLesson();
                } else if (mode.id === 'practice') {
                  router.push(`/portal/student/subjects/${subjectId}/practice`);
                }
              }}
              className={`bg-white rounded-2xl shadow-lg p-6 cursor-pointer transition-shadow hover:shadow-xl ${
                mode.id === 'lesson' && !topicInput.trim() ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <div className={`w-14 h-14 ${mode.color} rounded-xl flex items-center justify-center text-2xl mb-4 shadow-md`}>
                {mode.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{mode.title}</h3>
              <p className="text-gray-600 text-sm">{mode.description}</p>
              {mode.id === 'lesson' && !topicInput.trim() && (
                <p className="text-xs text-red-500 mt-2">Enter a topic above to start</p>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Recent Topics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-white rounded-2xl shadow-lg p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Topics</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {['Pythagorean theorem', 'Linear equations', 'Trigonometry basics', 'Calculus intro'].map(
              (topic, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setTopicInput(topic);
                    setTimeout(() => handleStartLesson(), 100);
                  }}
                  className="p-3 text-left rounded-lg border border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-colors text-gray-700 text-sm"
                >
                  {topic}
                </button>
              )
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
