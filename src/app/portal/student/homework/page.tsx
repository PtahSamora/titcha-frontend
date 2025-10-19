'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface Homework {
  id: string;
  subject: string;
  title: string;
  description?: string;
  dueDate: string;
  status: 'pending' | 'done' | 'overdue';
  createdAt: string;
}

export default function HomeworkPage() {
  const router = useRouter();
  const [homework, setHomework] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'done' | 'overdue'>('all');

  useEffect(() => {
    loadHomework();
  }, []);

  const loadHomework = async () => {
    try {
      // First, try to load from localStorage
      const localHomework = localStorage.getItem('student_homework');
      if (localHomework) {
        const homeworkList = JSON.parse(localHomework);
        // Map parent homework format to student format
        const formattedHomework = homeworkList.map((hw: any) => ({
          id: hw.id,
          subject: hw.subject,
          title: hw.title,
          description: `Difficulty Level ${hw.difficulty} - Assigned by parent`,
          dueDate: hw.dueDate,
          status: hw.status || 'pending',
          createdAt: hw.createdAt,
        }));
        setHomework(formattedHomework);
        setLoading(false);
        return;
      }

      // Fallback to API if no localStorage data
      const response = await fetch('/api/student/homework');
      const data = await response.json();
      setHomework(data.homework || []);
    } catch (error) {
      console.error('Failed to load homework:', error);
      // If API fails, still check localStorage
      const localHomework = localStorage.getItem('student_homework');
      if (localHomework) {
        const homeworkList = JSON.parse(localHomework);
        const formattedHomework = homeworkList.map((hw: any) => ({
          id: hw.id,
          subject: hw.subject,
          title: hw.title,
          description: `Difficulty Level ${hw.difficulty} - Assigned by parent`,
          dueDate: hw.dueDate,
          status: hw.status || 'pending',
          createdAt: hw.createdAt,
        }));
        setHomework(formattedHomework);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMarkDone = async (id: string) => {
    try {
      // Update localStorage first
      const localHomework = localStorage.getItem('student_homework');
      if (localHomework) {
        const homeworkList = JSON.parse(localHomework);
        const updatedList = homeworkList.map((hw: any) =>
          hw.id === id ? { ...hw, status: 'done', completion: 100 } : hw
        );
        localStorage.setItem('student_homework', JSON.stringify(updatedList));
      }

      // Try to update via API as well
      await fetch('/api/student/homework', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'done' }),
      });
      loadHomework();
    } catch (error) {
      console.error('Failed to mark homework as done:', error);
      // Reload from localStorage anyway
      loadHomework();
    }
  };

  const handleStartHomework = (hw: Homework) => {
    // Navigate to subject lesson page with topic
    router.push(`/portal/student/subjects/${hw.subject.toLowerCase()}/lesson?topic=${encodeURIComponent(hw.title)}`);
  };

  const filteredHomework = homework.filter(hw => {
    if (filter === 'all') return true;
    return hw.status === filter;
  });

  const stats = {
    total: homework.length,
    pending: homework.filter(hw => hw.status === 'pending').length,
    done: homework.filter(hw => hw.status === 'done').length,
    overdue: homework.filter(hw => hw.status === 'overdue').length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getSubjectColor = (subject: string) => {
    const colors: Record<string, string> = {
      math: 'from-purple-500 to-purple-600',
      mathematics: 'from-purple-500 to-purple-600',
      science: 'from-blue-500 to-blue-600',
      english: 'from-green-500 to-green-600',
    };
    return colors[subject.toLowerCase()] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/portal/student/dashboard')}
            className="mb-4 text-gray-600 hover:text-gray-900 flex items-center gap-2 transition-colors"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Homework</h1>
          <p className="text-gray-600">Manage your assignments and track your progress</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', value: stats.total, color: 'bg-blue-500' },
            { label: 'Pending', value: stats.pending, color: 'bg-yellow-500' },
            { label: 'Done', value: stats.done, color: 'bg-green-500' },
            { label: 'Overdue', value: stats.overdue, color: 'bg-red-500' },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-white text-2xl font-bold mb-3`}>
                {stat.value}
              </div>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Filter */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
          <div className="flex gap-2">
            {(['all', 'pending', 'done', 'overdue'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === f
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Homework List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : filteredHomework.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No homework found</h3>
            <p className="text-gray-600">
              {filter === 'all' ? 'You have no homework assignments yet.' : `You have no ${filter} homework.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredHomework.map((hw, idx) => (
              <motion.div
                key={hw.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-12 h-12 bg-gradient-to-br ${getSubjectColor(hw.subject)} rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-md`}>
                        {hw.subject.substring(0, 3).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{hw.title}</h3>
                        <p className="text-sm text-gray-600">{hw.subject}</p>
                      </div>
                    </div>

                    {hw.description && (
                      <p className="text-gray-700 mb-3 ml-15">{hw.description}</p>
                    )}

                    <div className="flex items-center gap-4 ml-15">
                      <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(hw.status)}`}>
                        {hw.status.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-600">
                        Due: {dayjs(hw.dueDate).format('MMM D, YYYY')}
                        <span className="ml-2 text-gray-500">({dayjs(hw.dueDate).fromNow()})</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {hw.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStartHomework(hw)}
                          className="px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 transition-colors"
                        >
                          Start
                        </button>
                        <button
                          onClick={() => handleMarkDone(hw.id)}
                          className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Mark Done
                        </button>
                      </>
                    )}
                    {hw.status === 'done' && (
                      <span className="text-green-600 text-2xl">✓</span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
