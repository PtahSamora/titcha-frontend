'use client';

import { motion } from 'framer-motion';
import { BookOpen, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface LessonCardProps {
  lesson: {
    id: string;
    topic: string;
    content: string;
    createdAt: string;
    duration?: number;
  };
}

export default function LessonCard({ lesson }: LessonCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-500" />
          <h4 className="font-semibold text-gray-900">{lesson.topic}</h4>
        </div>
        {lesson.duration && (
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>{Math.round(lesson.duration / 1000)}s</span>
          </div>
        )}
      </div>
      <p className="text-gray-600 text-sm line-clamp-3 mb-3">{lesson.content}</p>
      <p className="text-xs text-gray-400">{formatDate(lesson.createdAt)}</p>
    </motion.div>
  );
}
