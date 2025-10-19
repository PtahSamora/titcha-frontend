'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MCQuestion, CheckpointResult } from '@/lib/store';

interface CheckpointProps {
  questions: MCQuestion[];
  onComplete: (results: CheckpointResult[]) => void;
  onClose: () => void;
}

export function Checkpoint({ questions, onComplete, onClose }: CheckpointProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [hintsUsed, setHintsUsed] = useState<Record<number, number>>({});

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  const handleSelectOption = (optionIndex: number) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionIndex]: optionIndex,
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Calculate results
      const results: CheckpointResult[] = questions.map((q, idx) => ({
        questionId: q.id,
        selectedIndex: selectedAnswers[idx] ?? -1,
        correct: selectedAnswers[idx] === q.correctIndex,
      }));
      setShowResults(true);
      onComplete(results);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleUseHint = () => {
    const used = hintsUsed[currentQuestionIndex] || 0;
    if (used < 2) {
      setHintsUsed({
        ...hintsUsed,
        [currentQuestionIndex]: used + 1,
      });
    }
  };

  const calculateScore = () => {
    const correct = questions.filter(
      (q, idx) => selectedAnswers[idx] === q.correctIndex
    ).length;
    return Math.round((correct / totalQuestions) * 100);
  };

  if (showResults) {
    const score = calculateScore();
    const passed = score >= 70;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-center">
            <div className="text-6xl mb-4">
              {passed ? '🎉' : '📚'}
            </div>
            <h2 className="text-3xl font-bold mb-2">
              {passed ? 'Great Work!' : 'Keep Practicing!'}
            </h2>
            <div className="text-6xl font-bold text-primary-600 mb-4">
              {score}%
            </div>
            <p className="text-gray-600 mb-6">
              You got {questions.filter((q, idx) => selectedAnswers[idx] === q.correctIndex).length} out of {totalQuestions} questions correct.
            </p>

            {/* Results breakdown */}
            <div className="space-y-3 mb-6 text-left">
              {questions.map((q, idx) => {
                const isCorrect = selectedAnswers[idx] === q.correctIndex;
                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-lg border-2 ${
                      isCorrect
                        ? 'border-green-500 bg-green-50'
                        : 'border-red-500 bg-red-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">
                        {isCorrect ? '✓' : '✗'}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium text-sm mb-1">
                          Question {idx + 1}: {q.question}
                        </p>
                        {!isCorrect && (
                          <p className="text-xs text-gray-600">
                            Correct answer: {q.options[q.correctIndex]}
                          </p>
                        )}
                        {q.explanation && (
                          <p className="text-xs text-gray-700 mt-2 italic">
                            💡 {q.explanation}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={onClose}
              className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
            >
              Continue Learning
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Checkpoint Quiz
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Progress bar */}
          <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="absolute inset-y-0 left-0 bg-primary-600"
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </p>
        </div>

        {/* Question */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                {currentQuestion.question}
              </h3>

              {/* Options */}
              <div className="space-y-3 mb-6">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = selectedAnswers[currentQuestionIndex] === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'border-primary-600 bg-primary-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            isSelected
                              ? 'border-primary-600 bg-primary-600'
                              : 'border-gray-300'
                          }`}
                        >
                          {isSelected && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>
                        <span className="text-gray-900">{option}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Hint */}
              {currentQuestion.explanation && (
                <div className="mb-6">
                  <button
                    onClick={handleUseHint}
                    disabled={(hintsUsed[currentQuestionIndex] || 0) >= 2}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    💡 Need a hint? ({2 - (hintsUsed[currentQuestionIndex] || 0)} left)
                  </button>
                  {(hintsUsed[currentQuestionIndex] || 0) > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-gray-700"
                    >
                      {currentQuestion.explanation}
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            disabled={selectedAnswers[currentQuestionIndex] === undefined}
            className="px-6 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentQuestionIndex === totalQuestions - 1 ? 'Finish' : 'Next'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
