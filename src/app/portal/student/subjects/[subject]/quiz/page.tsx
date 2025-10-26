'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, XCircle, Award, Loader2, Clock } from 'lucide-react';
import { getActiveLessons, type ActiveLesson } from '@/hooks/useActiveLessons';
import { addQuizMerits } from '@/lib/merits';

const subjectData: Record<string, { name: string; icon: string; color: string }> = {
  math: { name: 'Mathematics', icon: '📐', color: '#9333EA' },
  science: { name: 'Science', icon: '🔬', color: '#3B82F6' },
  english: { name: 'English', icon: '📚', color: '#10B981' },
};

interface QuizQuestion {
  topic: string;
  type: 'multiple-choice' | 'open-ended';
  question: string;
  options?: string[];
  correct: string;
}

interface QuestionResult {
  question: string;
  studentAnswer: string;
  correctAnswer: string;
  score: number;
  feedback: string;
}

interface QuizResults {
  totalScore: number;
  maxScore: number;
  percentage: number;
  details: QuestionResult[];
}

export default function QuizPage() {
  const router = useRouter();
  const params = useParams();
  const subjectId = params.subject as string;
  const subject = subjectData[subjectId] || subjectData.math;

  const [activeLessons, setActiveLessons] = useState<ActiveLesson[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<(string | null)[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState<QuizResults | null>(null);

  // Timer state
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Deferred results state
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [quizSessionId, setQuizSessionId] = useState<string | null>(null);

  // Load active lessons on mount
  useEffect(() => {
    const lessons = getActiveLessons();
    const filtered = lessons.filter(lesson => lesson.url.includes(`/subjects/${subjectId}/`));
    setActiveLessons(filtered);
  }, [subjectId]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => setElapsedTime(prev => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Countdown effect for deferred results
  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [countdown]);

  // Fetch results when countdown reaches 0
  useEffect(() => {
    if (countdown === 0 && quizSubmitted && quizSessionId) {
      fetchQuizResults();
    }
  }, [countdown, quizSubmitted, quizSessionId]);

  const toggleTopic = (topic: string) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(selectedTopics.filter(t => t !== topic));
    } else {
      setSelectedTopics([...selectedTopics, topic]);
    }
  };

  // Format timer display (mm:ss)
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Format countdown display (mm:ss)
  const formatCountdown = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const generateQuiz = async () => {
    if (selectedTopics.length === 0) return;

    setIsLoading(true);
    setError('');
    setQuestions([]);
    setResults(null);

    try {
      const res = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: subject.name,
          topics: selectedTopics,
          questionsPerTopic: 7,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to generate quiz');
      }

      const data = await res.json();

      if (!data.questions || data.questions.length === 0) {
        throw new Error('No questions were generated');
      }

      setQuestions(data.questions);
      setAnswers(new Array(data.questions.length).fill(null));

      // Start timer
      setElapsedTime(0);
      setIsTimerRunning(true);
    } catch (error: any) {
      console.error('Error generating quiz:', error);
      setError(error.message || 'Failed to generate quiz. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const submitQuiz = async () => {
    setIsSubmitting(true);
    setError('');
    setIsTimerRunning(false); // Stop timer

    try {
      const res = await fetch('/api/grade-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: subject.name,
          questions,
          answers,
          elapsedTime, // Include time taken
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to submit quiz');
      }

      const data = await res.json();

      // Set quiz session ID for later retrieval
      setQuizSessionId(data.sessionId);

      // Show waiting screen with 15-minute countdown
      setQuizSubmitted(true);
      setCountdown(900); // 15 minutes = 900 seconds
    } catch (error: any) {
      console.error('Error submitting quiz:', error);
      setError(error.message || 'Failed to submit quiz. Please try again.');
      setIsTimerRunning(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetch quiz results after countdown
  const fetchQuizResults = async () => {
    try {
      const res = await fetch('/api/quiz-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: quizSessionId,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to retrieve quiz results');
      }

      const result = await res.json();
      setResults(result);

      // Add merits based on score
      addQuizMerits(result.totalScore, subject.name);

      // Scroll to results
      setTimeout(() => {
        document.getElementById('quiz-results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error: any) {
      console.error('Error fetching quiz results:', error);
      setError(error.message || 'Failed to retrieve quiz results. Please try again.');
    }
  };

  const resetQuiz = () => {
    setQuestions([]);
    setAnswers([]);
    setResults(null);
    setSelectedTopics([]);
    setError('');
    setElapsedTime(0);
    setIsTimerRunning(false);
    setQuizSubmitted(false);
    setCountdown(0);
    setQuizSessionId(null);
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getGradeLabel = (percentage: number) => {
    if (percentage >= 90) return 'Outstanding!';
    if (percentage >= 80) return 'Excellent!';
    if (percentage >= 70) return 'Good Job!';
    if (percentage >= 60) return 'Keep Practicing!';
    return 'Needs Improvement';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-3xl mx-auto">
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
              <h1 className="text-4xl font-bold text-gray-900">Take a Quiz</h1>
              <p className="text-gray-600 mt-1">
                Select lessons to be quizzed on and test your understanding. The quiz will mix multiple-choice and open questions.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Lesson Selection */}
        {!results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6 mb-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Select Lessons to Quiz On
            </h2>

            {activeLessons.length === 0 ? (
              <div className="text-gray-600 text-sm">
                <p className="mb-3">No past lessons found. Start a lesson first to take a quiz.</p>
                <button
                  onClick={() => router.push(`/portal/student/subjects/${subjectId}`)}
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  Go to lessons →
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {activeLessons.map((lesson) => (
                    <label
                      key={lesson.topic}
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        value={lesson.topic}
                        checked={selectedTopics.includes(lesson.topic)}
                        onChange={() => toggleTopic(lesson.topic)}
                        className="w-5 h-5 accent-purple-600 cursor-pointer"
                      />
                      <span className="text-gray-900 font-medium">{lesson.topic}</span>
                    </label>
                  ))}
                </div>

                <div className="pt-2">
                  <button
                    onClick={generateQuiz}
                    disabled={selectedTopics.length === 0 || isLoading || questions.length > 0}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Preparing your quiz...
                      </>
                    ) : (
                      <>Generate Quiz ({selectedTopics.length} topic{selectedTopics.length !== 1 ? 's' : ''})</>
                    )}
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}
          </motion.div>
        )}

        {/* Quiz Questions */}
        {questions.length > 0 && !results && !quizSubmitted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-xl font-bold text-gray-900">
                  Quiz: {selectedTopics.join(', ')}
                </h2>
                {isTimerRunning && (
                  <div className="flex items-center gap-2 text-purple-600 font-semibold">
                    <Clock className="h-5 w-5" />
                    <span className="text-lg">{formatTime(elapsedTime)}</span>
                  </div>
                )}
              </div>
              <p className="text-gray-600 text-sm">
                {questions.length} questions • Answer all questions and submit when ready
              </p>
            </div>

            {questions.map((q, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + idx * 0.05 }}
                className="bg-white shadow-lg rounded-2xl p-6 border-2 border-transparent"
              >
                {/* Question Header */}
                <div className="flex items-start gap-3 mb-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 text-purple-600 font-bold flex items-center justify-center text-sm">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-lg">{q.question}</p>
                    <span className="text-xs text-gray-500 mt-1 inline-block">
                      {q.type === 'multiple-choice' ? 'Multiple Choice' : 'Open-Ended'} • {q.topic}
                    </span>
                  </div>
                </div>

                {/* Answer Options */}
                {q.type === 'multiple-choice' ? (
                  <div className="space-y-2 ml-11">
                    {q.options?.map((opt, i) => (
                      <label
                        key={i}
                        className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <input
                          type="radio"
                          name={`q-${idx}`}
                          value={opt}
                          checked={answers[idx] === opt}
                          onChange={(e) => handleAnswer(idx, e.target.value)}
                          className="w-4 h-4 accent-purple-600 cursor-pointer"
                        />
                        <span className="text-gray-900">{opt}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="ml-11">
                    <textarea
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 resize-none"
                      rows={4}
                      placeholder="Type your answer here... Show your work and explain your reasoning."
                      value={answers[idx] || ''}
                      onChange={(e) => handleAnswer(idx, e.target.value)}
                    />
                  </div>
                )}
              </motion.div>
            ))}

            {/* Submit Button */}
            <div className="sticky bottom-6 bg-white rounded-2xl shadow-xl p-6 border-2 border-purple-200">
              <button
                onClick={submitQuiz}
                disabled={isSubmitting}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-lg font-semibold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin" />
                    Grading your quiz...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-6 w-6" />
                    Submit Quiz
                  </>
                )}
              </button>
              <p className="text-center text-sm text-gray-600 mt-2">
                Make sure you've answered all questions before submitting
              </p>
            </div>
          </motion.div>
        )}

        {/* Waiting Screen - 15 Minute Countdown */}
        {quizSubmitted && countdown > 0 && !results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-12 text-center"
          >
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">⏳ Your Quiz is Being Evaluated</h2>
            <p className="text-lg text-gray-600 mb-6">
              Please wait while we carefully grade your answers.<br />
              Results will appear in <span className="font-bold text-purple-600">{formatCountdown(countdown)}</span>
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
              <p className="font-medium mb-1">Why the wait?</p>
              <p>We're using AI to provide detailed feedback on your open-ended answers and ensure accurate grading.</p>
            </div>
          </motion.div>
        )}

        {/* Results Display */}
        {results && (
          <motion.div
            id="quiz-results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Score Card */}
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center justify-center mb-4">
                <Award className="h-16 w-16" />
              </div>
              <h2 className="text-3xl font-bold text-center mb-2">Quiz Complete!</h2>
              <div className="text-center">
                <p className="text-5xl font-bold mb-2">
                  {results.totalScore.toFixed(1)} / {results.maxScore}
                </p>
                <p className="text-2xl font-semibold mb-4">
                  {results.percentage}% • {getGradeLabel(results.percentage)}
                </p>
              </div>
              <button
                onClick={resetQuiz}
                className="w-full bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors mt-4"
              >
                Take Another Quiz
              </button>
            </div>

            {/* Detailed Results */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Detailed Results</h3>

              {results.details.map((d, i) => (
                <div
                  key={i}
                  className={`border-2 rounded-lg p-4 mb-4 ${
                    d.score >= 1 ? 'border-green-200 bg-green-50' :
                    d.score >= 0.7 ? 'border-blue-200 bg-blue-50' :
                    d.score >= 0.5 ? 'border-yellow-200 bg-yellow-50' :
                    'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-white border-2 border-gray-300 font-bold flex items-center justify-center text-sm">
                      {i + 1}
                    </span>
                    <p className="flex-1 font-semibold text-gray-900">{d.question}</p>
                    {d.score >= 1 ? (
                      <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
                    )}
                  </div>

                  <div className="ml-11 space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Your Answer:</span>
                      <p className="text-gray-900 mt-1">{d.studentAnswer}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Correct Answer:</span>
                      <p className="text-gray-900 mt-1">{d.correctAnswer}</p>
                    </div>
                    <div className={`font-medium ${
                      d.score >= 1 ? 'text-green-700' :
                      d.score >= 0.7 ? 'text-blue-700' :
                      d.score >= 0.5 ? 'text-yellow-700' :
                      'text-red-700'
                    }`}>
                      {d.feedback} ({d.score.toFixed(1)}/1.0)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
