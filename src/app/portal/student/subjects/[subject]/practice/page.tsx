'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Lightbulb, Check, X, RefreshCw, Loader2 } from 'lucide-react';
import { getActiveLessons, type ActiveLesson } from '@/hooks/useActiveLessons';

const subjectData: Record<string, { name: string; icon: string; color: string }> = {
  math: { name: 'Mathematics', icon: '📐', color: '#9333EA' },
  science: { name: 'Science', icon: '🔬', color: '#3B82F6' },
  english: { name: 'English', icon: '📚', color: '#10B981' },
};

interface PracticeProblem {
  question: string;
  hint: string;
  answer: string;
}

export default function PracticePage() {
  const router = useRouter();
  const params = useParams();
  const subjectId = params.subject as string;
  const subject = subjectData[subjectId] || subjectData.math;

  const [activeLessons, setActiveLessons] = useState<ActiveLesson[]>([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [problems, setProblems] = useState<PracticeProblem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // State for each problem
  const [answers, setAnswers] = useState<string[]>([]);
  const [showHint, setShowHint] = useState<boolean[]>([]);
  const [feedback, setFeedback] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean[]>([]);

  // Load active lessons on mount
  useEffect(() => {
    const lessons = getActiveLessons();
    const filtered = lessons.filter(lesson => lesson.url.includes(`/subjects/${subjectId}/`));
    setActiveLessons(filtered);
  }, [subjectId]);

  const handleTopicSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTopic(e.target.value);
    // Reset problems when changing topic
    setProblems([]);
    setError('');
  };

  const generateProblems = async () => {
    if (!selectedTopic) return;

    setIsLoading(true);
    setError('');
    setProblems([]);

    try {
      const res = await fetch('/api/generate-practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: subject.name,
          topic: selectedTopic,
          numProblems: 5,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to generate problems');
      }

      const data = await res.json();

      if (!data.problems || data.problems.length === 0) {
        throw new Error('No problems were generated');
      }

      setProblems(data.problems);
      // Initialize state arrays
      setAnswers(new Array(data.problems.length).fill(''));
      setShowHint(new Array(data.problems.length).fill(false));
      setFeedback(new Array(data.problems.length).fill(''));
      setIsCorrect(new Array(data.problems.length).fill(false));
    } catch (error: any) {
      console.error('Error generating problems:', error);
      setError(error.message || 'Failed to generate practice problems. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleHint = (index: number) => {
    const newShowHint = [...showHint];
    newShowHint[index] = !newShowHint[index];
    setShowHint(newShowHint);
  };

  const checkAnswer = (index: number) => {
    const userAnswer = answers[index].trim().toLowerCase();
    const correctAnswer = problems[index].answer.trim().toLowerCase();

    const newFeedback = [...feedback];
    const newIsCorrect = [...isCorrect];

    if (userAnswer === correctAnswer) {
      newFeedback[index] = '✅ Correct! Great job.';
      newIsCorrect[index] = true;
    } else {
      newFeedback[index] = '❌ Try again.';
      newIsCorrect[index] = false;
    }

    setFeedback(newFeedback);
    setIsCorrect(newIsCorrect);
  };

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);

    // Clear feedback when user starts typing again
    if (feedback[index]) {
      const newFeedback = [...feedback];
      newFeedback[index] = '';
      setFeedback(newFeedback);
    }
  };

  const resetProblems = () => {
    setProblems([]);
    setSelectedTopic('');
    setError('');
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
            onClick={() => router.push(`/portal/student/subjects/${subjectId}`)}
            className="mb-4 text-gray-600 hover:text-gray-900 flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to {subject.name}
          </button>

          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg"
              style={{ backgroundColor: subject.color }}
            >
              {subject.icon}
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Practice Problems</h1>
              <p className="text-gray-600 mt-1">Test your knowledge with practice problems</p>
            </div>
          </div>
        </motion.div>

        {/* Lesson Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-6"
        >
          <label className="block text-lg font-semibold text-gray-900 mb-3">
            Select a lesson to practice
          </label>

          {activeLessons.length === 0 ? (
            <div className="text-gray-600 text-sm">
              <p>No active lessons found. Start a lesson first to generate practice problems.</p>
              <button
                onClick={() => router.push(`/portal/student/subjects/${subjectId}`)}
                className="mt-3 text-purple-600 hover:text-purple-700 font-medium"
              >
                Go to lessons →
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <select
                value={selectedTopic}
                onChange={handleTopicSelect}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
              >
                <option value="">Select a lesson topic</option>
                {activeLessons.map((lesson) => (
                  <option key={lesson.url} value={lesson.topic}>
                    {lesson.topic}
                  </option>
                ))}
              </select>

              <button
                onClick={generateProblems}
                disabled={!selectedTopic || isLoading}
                className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Generating Problems...
                  </>
                ) : (
                  <>
                    <Lightbulb className="h-5 w-5" />
                    Generate Practice Problems
                  </>
                )}
              </button>

              {problems.length > 0 && (
                <button
                  onClick={resetProblems}
                  className="w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="h-5 w-5" />
                  Start Over
                </button>
              )}
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
        </motion.div>

        {/* Practice Problems */}
        {problems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {problems.length} Problems for "{selectedTopic}"
              </h2>
              <span className="text-sm text-gray-600">
                {isCorrect.filter(Boolean).length} / {problems.length} correct
              </span>
            </div>

            {problems.map((problem, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className={`bg-white shadow-lg rounded-2xl p-6 space-y-4 border-2 ${
                  isCorrect[index]
                    ? 'border-green-300 bg-green-50'
                    : feedback[index]
                    ? 'border-red-300'
                    : 'border-transparent'
                }`}
              >
                {/* Problem Number and Question */}
                <div>
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 text-purple-600 font-bold flex items-center justify-center text-sm">
                      {index + 1}
                    </span>
                    <p className="flex-1 font-semibold text-gray-900 text-lg pt-1">
                      {problem.question}
                    </p>
                  </div>
                </div>

                {/* Hint */}
                {showHint[index] && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-blue-50 border border-blue-200 rounded-lg p-4"
                  >
                    <div className="flex items-start gap-2">
                      <Lightbulb className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <p className="text-blue-800 text-sm italic">{problem.hint}</p>
                    </div>
                  </motion.div>
                )}

                {/* Answer Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your answer:
                  </label>
                  <input
                    type="text"
                    value={answers[index]}
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && checkAnswer(index)}
                    placeholder="Type your answer here..."
                    disabled={isCorrect[index]}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => toggleHint(index)}
                    disabled={isCorrect[index]}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Lightbulb className="h-4 w-4" />
                    {showHint[index] ? 'Hide hint' : 'Show hint'}
                  </button>

                  <button
                    onClick={() => checkAnswer(index)}
                    disabled={!answers[index].trim() || isCorrect[index]}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Check className="h-4 w-4" />
                    Check Answer
                  </button>
                </div>

                {/* Feedback */}
                {feedback[index] && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg font-medium ${
                      isCorrect[index]
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}
                  >
                    {feedback[index]}
                    {!isCorrect[index] && (
                      <div className="text-sm mt-2 text-red-700">
                        Hint: Try again or show the hint for help!
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            ))}

            {/* Completion Message */}
            {isCorrect.filter(Boolean).length === problems.length && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl p-8 text-center shadow-xl"
              >
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-3xl font-bold mb-2">Excellent Work!</h3>
                <p className="text-lg opacity-90">
                  You've completed all practice problems for "{selectedTopic}"
                </p>
                <button
                  onClick={resetProblems}
                  className="mt-6 bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors inline-flex items-center gap-2"
                >
                  <RefreshCw className="h-5 w-5" />
                  Try More Problems
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
