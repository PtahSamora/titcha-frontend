'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useLessonStore } from '@/lib/store';
import { Board } from '@/components/lesson/Board';
import { AIStreamOnBoard } from '@/components/lesson/AIStreamOnBoard';
import { ToolDock } from '@/components/lesson/ToolDock';
import { Checkpoint } from '@/components/lesson/Checkpoint';
import type { ExcalidrawImperativeAPI } from '@/components/lesson/Board';

const subjectData: Record<string, { name: string; icon: string; color: string }> = {
  math: { name: 'Mathematics', icon: '📐', color: '#9333EA' },
  science: { name: 'Science', icon: '🔬', color: '#3B82F6' },
  english: { name: 'English', icon: '📚', color: '#10B981' },
};

export default function LessonWorkspacePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const subjectId = params.subject as string;
  const topic = searchParams.get('topic') || '';
  const subject = subjectData[subjectId] || subjectData.math;

  const {
    boardTheme,
    blocks,
    checkpoint,
    loading,
    error,
    toggleTheme,
    startLesson,
    askQuestion,
    loadCheckpoint,
    submitCheckpoint,
    explainImage,
  } = useLessonStore();

  const [questionInput, setQuestionInput] = useState('');
  const [showCheckpoint, setShowCheckpoint] = useState(false);
  const boardRef = useRef<ExcalidrawImperativeAPI | null>(null);

  useEffect(() => {
    if (topic && subjectId) {
      startLesson(subject.name, topic);
    }
  }, [topic, subjectId]);

  useEffect(() => {
    if (checkpoint) {
      setShowCheckpoint(true);
    }
  }, [checkpoint]);

  const handleAskQuestion = async () => {
    if (!questionInput.trim()) return;
    await askQuestion(questionInput);
    setQuestionInput('');
  };

  const handleUploadImage = async (file: File) => {
    await explainImage(file);
  };

  const handleLoadCheckpoint = async () => {
    await loadCheckpoint(topic);
  };

  const handleCheckpointComplete = (results: any[]) => {
    submitCheckpoint(results);
    setShowCheckpoint(false);
  };

  return (
    <div className="lesson-workspace h-screen flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm px-6 py-3 flex items-center justify-between z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/portal/student/subjects/${subjectId}`)}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Back
          </button>
          <div className="h-6 w-px bg-gray-300" />
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
              style={{ backgroundColor: subject.color }}
            >
              {subject.icon}
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{topic}</h1>
              <p className="text-xs text-gray-600">{subject.name}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-sm font-medium text-gray-700"
            title="Toggle board theme"
          >
            {boardTheme === 'blackboard' ? '🌙 Dark' : '☀️ Light'}
          </button>

          {/* Checkpoint Button */}
          <button
            onClick={handleLoadCheckpoint}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold transition-colors disabled:opacity-50"
          >
            ✅ Take Quiz
          </button>

          {/* Export */}
          <button
            onClick={() => {
              // Export handled by Excalidraw UI
            }}
            className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-sm font-medium text-gray-700"
          >
            📥 Export
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Board Area */}
        <div className="flex-1 relative">
          <Board
            theme={boardTheme}
            initialElements={[]}
            onChange={(elements) => {
              // Handle board changes if needed
            }}
          />

          {/* AI Content Overlay */}
          <AIStreamOnBoard blocks={blocks} boardTheme={boardTheme} />

          {/* Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-30 pointer-events-none">
              <div className="bg-white rounded-lg shadow-lg p-6 flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600" />
                <span className="text-gray-900 font-medium">AI is thinking...</span>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-30">
              {error}
            </div>
          )}
        </div>

        {/* Tool Dock */}
        <ToolDock onUpload={handleUploadImage} />
      </div>

      {/* Bottom Question Bar */}
      <div className="bg-white border-t border-gray-200 shadow-lg px-6 py-4 z-20">
        <div className="max-w-4xl mx-auto flex gap-3">
          <input
            type="text"
            value={questionInput}
            onChange={(e) => setQuestionInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAskQuestion()}
            placeholder="Ask a question about this topic..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
            disabled={loading}
          />
          <button
            onClick={handleAskQuestion}
            disabled={!questionInput.trim() || loading}
            className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Ask AI
          </button>
        </div>
      </div>

      {/* Checkpoint Modal */}
      {showCheckpoint && checkpoint && (
        <Checkpoint
          questions={checkpoint}
          onComplete={handleCheckpointComplete}
          onClose={() => setShowCheckpoint(false)}
        />
      )}
    </div>
  );
}
