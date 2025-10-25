'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { MessageSquare, X } from 'lucide-react';
import { useLessonStore } from '@/lib/store';
import { Board } from '@/components/lesson/Board';
import { AIStreamOnBoard } from '@/components/lesson/AIStreamOnBoard';
import { ToolDock } from '@/components/lesson/ToolDock';
import { Checkpoint } from '@/components/lesson/Checkpoint';
import LessonChat from '@/components/LessonChat';
// Type for Excalidraw API reference
type ExcalidrawImperativeAPI = any;

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
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const boardRef = useRef<ExcalidrawImperativeAPI | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

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

  // Auto-scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleAskQuestion = async () => {
    if (!questionInput.trim() || chatLoading) return;

    const userMessage = { role: 'user' as const, text: questionInput };
    setChatMessages((prev) => [...prev, userMessage]);
    const question = questionInput;
    setQuestionInput('');
    setChatLoading(true);

    try {
      const res = await fetch('/api/ai/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: subject.name,
          topic: topic,
          question: question,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'AI Tutor failed to respond');
      }

      const assistantMessage = { role: 'assistant' as const, text: data.reply };
      setChatMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Error getting AI response:', error);
      const errorMessage = {
        role: 'assistant' as const,
        text: error.message || 'Sorry, I encountered an error. Please try again.',
      };
      setChatMessages((prev) => [...prev, errorMessage]);
    } finally {
      setChatLoading(false);
    }
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
          {/* Chat Toggle */}
          <button
            onClick={() => setShowChat(!showChat)}
            className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium flex items-center gap-2 ${
              showChat
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            title="Toggle AI Tutor Chat"
          >
            <MessageSquare className="h-4 w-4" />
            AI Tutor
          </button>

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
        <div className={`relative transition-all duration-300 ${showChat ? 'flex-[0.6]' : 'flex-1'}`}>
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

        {/* Chat Panel */}
        {showChat && (
          <div className="flex-[0.4] border-l border-gray-200 bg-white relative">
            <button
              onClick={() => setShowChat(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Close chat"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
            <div className="h-full p-4">
              <LessonChat subject={subject.name} topic={topic} />
            </div>
          </div>
        )}

        {/* Tool Dock */}
        {!showChat && <ToolDock onUpload={handleUploadImage} />}
      </div>

      {/* Bottom Chat Area */}
      <div className="bg-white border-t border-gray-200 shadow-lg z-20 flex flex-col" style={{ height: '300px' }}>
        {/* Chat Messages */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto px-6 py-4 space-y-3"
          style={{ scrollbarWidth: 'thin' }}
        >
          {chatMessages.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              <p className="text-sm">Ask a question about {topic || 'this topic'} to get started!</p>
            </div>
          )}
          {chatMessages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  msg.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-800 border border-gray-200'
                }`}
              >
                <p className="whitespace-pre-wrap text-sm">{msg.text}</p>
              </div>
            </div>
          ))}
          {chatLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 border border-gray-200 rounded-lg px-4 py-2">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="text-sm text-gray-500 italic">Titcha is thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="border-t border-gray-200 px-6 py-3">
          <div className="max-w-4xl mx-auto flex gap-3">
            <input
              type="text"
              value={questionInput}
              onChange={(e) => setQuestionInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleAskQuestion()}
              placeholder={`Ask about ${topic || 'this topic'}...`}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 text-sm"
              disabled={chatLoading}
            />
            <button
              onClick={handleAskQuestion}
              disabled={!questionInput.trim() || chatLoading}
              className="px-5 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Send
            </button>
          </div>
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
