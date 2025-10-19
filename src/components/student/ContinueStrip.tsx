'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface ContinueActivity {
  id: string;
  type: 'lesson' | 'homework' | 'practice';
  subject: string;
  title: string;
  url: string;
  progress: number;
  lastAccessed: string;
}

export function ContinueStrip() {
  const [activities, setActivities] = useState<ContinueActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      const response = await fetch('/api/student/continue');
      const data = await response.json();

      if (data.success) {
        setActivities(data.data || []);
      }
    } catch (error) {
      console.error('Failed to load continue activities:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="continue-strip bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return null; // Don't show if no activities
  }

  const typeIcons = {
    lesson: '📚',
    homework: '📝',
    practice: '🎯',
  };

  const typeLabels = {
    lesson: 'Lesson',
    homework: 'Homework',
    practice: 'Practice',
  };

  return (
    <div className="continue-strip bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl shadow-sm border border-purple-200 p-6 mb-8">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Continue Where You Left Off</h3>
      <div className="grid gap-3">
        {activities.slice(0, 3).map((activity) => (
          <Link key={activity.id} href={activity.url}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white rounded-lg p-4 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="text-3xl">{typeIcons[activity.type]}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-0.5 rounded">
                    {typeLabels[activity.type]}
                  </span>
                  <span className="text-xs text-gray-500">{activity.subject}</span>
                </div>
                <h4 className="text-sm font-semibold text-gray-900 mb-1">{activity.title}</h4>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-purple-600 h-1.5 rounded-full"
                      style={{ width: `${activity.progress}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-600">{activity.progress}%</span>
                </div>
              </div>
              <div className="text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}

/**
 * Helper function to update continue activity
 * Call this when user starts or progresses through a lesson
 */
export async function updateContinueActivity(
  type: 'lesson' | 'homework' | 'practice',
  subject: string,
  title: string,
  url: string,
  progress: number
) {
  try {
    await fetch('/api/student/continue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, subject, title, url, progress }),
    });
  } catch (error) {
    console.error('Failed to update continue activity:', error);
  }
}
