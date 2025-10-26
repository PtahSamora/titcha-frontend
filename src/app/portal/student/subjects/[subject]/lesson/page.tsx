'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { RefreshCw, Sparkles, User, Bot, Send, Camera, Paperclip, MessageCircle, Pen, Eraser, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { ReactSketchCanvas, ReactSketchCanvasRef } from 'react-sketch-canvas';

// Types
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
}

type InputMode = 'chat' | 'write';

const subjectData: Record<string, { name: string; icon: string; color: string; gradient: string }> = {
  math: {
    name: 'Mathematics',
    icon: '📐',
    color: '#9333EA',
    gradient: 'from-purple-500 to-pink-500'
  },
  science: {
    name: 'Science',
    icon: '🔬',
    color: '#3B82F6',
    gradient: 'from-blue-500 to-cyan-500'
  },
  english: {
    name: 'English',
    icon: '📚',
    color: '#10B981',
    gradient: 'from-green-500 to-emerald-500'
  },
};

export default function LessonBoardPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const subjectId = params.subject as string;
  const topic = searchParams.get('topic') || '';
  const subject = subjectData[subjectId] || subjectData.math;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [questionInput, setQuestionInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [inputMode, setInputMode] = useState<InputMode>('chat');
  const [drawingTool, setDrawingTool] = useState<'pen' | 'eraser'>('pen');
  const [writeNoteInput, setWriteNoteInput] = useState('');
  const [hasDrawing, setHasDrawing] = useState(false);

  const boardRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<ReactSketchCanvasRef>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // localStorage key for this specific lesson
  const storageKey = `titcha-lesson-${subjectId}-${topic.replace(/\s+/g, '-')}`;

  // Load messages from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setMessages(parsed);
        } catch (error) {
          console.error('Failed to parse stored messages:', error);
        }
      } else {
        // Add welcome message if no history
        const welcomeMessage: ChatMessage = {
          id: `welcome-${Date.now()}`,
          role: 'assistant',
          text: `Welcome to your ${subject.name} lesson on **${topic}**! 🎓\n\nI'm Titcha, your AI tutor. Ask me anything about this topic, and I'll provide clear, structured explanations to help you learn. Let's get started!`,
          timestamp: Date.now(),
        };
        setMessages([welcomeMessage]);
        localStorage.setItem(storageKey, JSON.stringify([welcomeMessage]));
      }
    }
  }, [subjectId, topic, storageKey, subject.name]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined' && messages.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    }
  }, [messages, storageKey]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (boardRef.current) {
      boardRef.current.scrollTo({
        top: boardRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  // Handle sending a question
  const handleAskQuestion = async (questionText?: string) => {
    const question = questionText || questionInput;
    if (!question.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: question,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!questionText) setQuestionInput('');
    setIsLoading(true);

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

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: data.reply,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Error getting AI response:', error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        text: `Sorry, I encountered an error: ${error.message || 'Please try again.'}`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  // Handle OCR from image (for camera/upload)
  const handleOCR = async (imageBase64: string, userText?: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ocr-handwriting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_base64: imageBase64,
          user_text: userText || ''
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'OCR failed');
      }

      // Combine user text and recognized text
      let fullPrompt = '';
      if (userText && data.text) {
        fullPrompt = `${userText}\n\nHere is my handwritten equation:\n${data.text}`;
      } else if (userText) {
        fullPrompt = userText;
      } else if (data.text) {
        fullPrompt = data.text;
      }

      // Forward to AI tutor
      if (fullPrompt) {
        await handleAskQuestion(fullPrompt);
      }
    } catch (error: any) {
      console.error('OCR Error:', error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        text: `Sorry, I couldn't read the handwriting: ${error.message || 'Please try again.'}`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setIsLoading(false);
    }
  };

  // Handle canvas send (Write Mode)
  const handleCanvasSend = async () => {
    if (!canvasRef.current || isLoading) return;
    if (!hasDrawing && !writeNoteInput.trim()) return;

    try {
      let imageData = '';

      // Only export canvas if there's a drawing
      if (hasDrawing) {
        imageData = await canvasRef.current.exportImage('png');
      }

      // Send with optional user text
      if (hasDrawing) {
        await handleOCR(imageData, writeNoteInput.trim());
        canvasRef.current.clearCanvas();
        setHasDrawing(false);
      }

      setWriteNoteInput('');
    } catch (error) {
      console.error('Canvas export error:', error);
    }
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      handleOCR(base64);
    };
    reader.readAsDataURL(file);
  };

  // Reset lesson and clear history
  const handleResetLesson = () => {
    if (confirm('Are you sure you want to reset this lesson? All chat history will be cleared.')) {
      const welcomeMessage: ChatMessage = {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        text: `Welcome to your ${subject.name} lesson on **${topic}**! 🎓\n\nI'm Titcha, your AI tutor. Ask me anything about this topic, and I'll provide clear, structured explanations to help you learn. Let's get started!`,
        timestamp: Date.now(),
      };
      setMessages([welcomeMessage]);
      localStorage.setItem(storageKey, JSON.stringify([welcomeMessage]));
    }
  };

  // Render markdown with LaTeX math support
  const renderMarkdown = (text: string) => {
    // Normalize LaTeX delimiters: convert \(...\) to $...$ for inline math
    const normalizedText = text
      .replace(/\\\(/g, '$')
      .replace(/\\\)/g, '$');

    return (
      <ReactMarkdown
        remarkPlugins={[[remarkMath, { singleDollarTextMath: true }]]}
        rehypePlugins={[rehypeKatex]}
      >
        {normalizedText}
      </ReactMarkdown>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Top Header Bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm px-4 md:px-6 py-3 flex items-center justify-between z-20">
        <div className="flex items-center gap-3 md:gap-4">
          <button
            onClick={() => router.push(`/portal/student/subjects/${subjectId}`)}
            className="text-gray-600 hover:text-gray-900 transition-colors text-sm md:text-base"
          >
            ← Back
          </button>
          <div className="h-6 w-px bg-gray-300 hidden md:block" />
          <div className="flex items-center gap-2 md:gap-3">
            <div
              className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center text-lg md:text-xl bg-gradient-to-br ${subject.gradient}`}
            >
              {subject.icon}
            </div>
            <div>
              <h1 className="text-sm md:text-lg font-bold text-gray-900">{topic}</h1>
              <p className="text-xs text-gray-600 hidden md:block">{subject.name}</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleResetLesson}
          className="px-3 md:px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-xs md:text-sm font-medium text-gray-700 flex items-center gap-2"
          title="Reset lesson and clear chat history"
        >
          <RefreshCw className="h-3 w-3 md:h-4 md:w-4" />
          <span className="hidden md:inline">Reset Lesson</span>
        </button>
      </div>

      {/* Main Scrollable Board with Chat Cards */}
      <div
        ref={boardRef}
        className="flex-1 overflow-y-auto px-4 md:px-8 py-6 md:py-8 space-y-4 md:space-y-6"
        style={{ scrollbarWidth: 'thin' }}
      >
        <div className="max-w-4xl mx-auto">
          <AnimatePresence initial={false}>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`mb-4 md:mb-6 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {/* AI Message Card (Left-aligned) */}
                {message.role === 'assistant' && (
                  <div className="max-w-full md:max-w-[85%] bg-white border-2 border-gray-200 rounded-2xl shadow-md hover:shadow-lg transition-shadow p-4 md:p-6">
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br ${subject.gradient} flex items-center justify-center flex-shrink-0`}>
                        <Bot className="h-4 w-4 md:h-5 md:w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-sm md:text-base font-semibold text-gray-900">Titcha AI Tutor</h3>
                          <Sparkles className="h-3 w-3 md:h-4 md:w-4 text-yellow-500" />
                        </div>
                        <div className="text-sm md:text-base text-gray-700 leading-relaxed">
                          {renderMarkdown(message.text)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* User Message Card (Right-aligned) */}
                {message.role === 'user' && (
                  <div className="max-w-full md:max-w-[75%] bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-md hover:shadow-lg transition-shadow p-4 md:p-5">
                    <div className="flex items-start gap-3 justify-end">
                      <div className="flex-1 min-w-0 text-right">
                        <div className="flex items-center gap-2 mb-2 justify-end">
                          <h3 className="text-sm md:text-base font-semibold text-white">You</h3>
                        </div>
                        <div className="text-sm md:text-base text-white leading-relaxed">
                          {renderMarkdown(message.text)}
                        </div>
                      </div>
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 md:h-5 md:w-5 text-white" />
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading Indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start mb-6"
            >
              <div className="max-w-[85%] bg-white border-2 border-gray-200 rounded-2xl shadow-md p-6">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${subject.gradient} flex items-center justify-center animate-pulse`}>
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-sm text-gray-500 italic ml-2">Titcha is thinking...</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Bottom Fixed Input Bar */}
      <div className="bg-white border-t-2 border-gray-200 shadow-2xl px-4 md:px-6 py-3 md:py-4 z-20">
        <div className="max-w-4xl mx-auto">
          {/* Mode Toggle */}
          <div className="flex justify-center mb-3">
            <div className="inline-flex items-center gap-2 bg-gray-100 rounded-full p-1">
              <button
                onClick={() => setInputMode('chat')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  inputMode === 'chat'
                    ? 'bg-white text-gray-900 shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <MessageCircle className="h-4 w-4" />
                Chat
              </button>
              <button
                onClick={() => setInputMode('write')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  inputMode === 'write'
                    ? 'bg-white text-gray-900 shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Pen className="h-4 w-4" />
                Write
              </button>
            </div>
          </div>

          {/* Chat Mode */}
          {inputMode === 'chat' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-2 md:gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={questionInput}
                  onChange={(e) => setQuestionInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAskQuestion();
                    }
                  }}
                  placeholder={`Ask about ${topic || 'this topic'}...`}
                  className="flex-1 px-3 md:px-4 py-2 md:py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-sm md:text-base transition-all"
                  disabled={isLoading}
                />

                {/* Camera Button */}
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  disabled={isLoading}
                  className="p-2 md:p-3 rounded-xl border-2 border-gray-300 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Take photo"
                >
                  <Camera className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
                </button>

                {/* Upload Button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="p-2 md:p-3 rounded-xl border-2 border-gray-300 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Upload image"
                >
                  <Paperclip className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
                </button>

                {/* Send Button */}
                <button
                  onClick={() => handleAskQuestion()}
                  disabled={!questionInput.trim() || isLoading}
                  className={`px-4 md:px-6 py-2 md:py-3 rounded-xl font-semibold text-sm md:text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
                    isLoading
                      ? 'bg-gray-400 text-white'
                      : `bg-gradient-to-r ${subject.gradient} text-white hover:shadow-lg transform hover:scale-105`
                  }`}
                >
                  <Send className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="hidden md:inline">Send</span>
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Press Enter to send • Shift+Enter for new line
              </p>
            </motion.div>
          )}

          {/* Write Mode */}
          {inputMode === 'write' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Canvas */}
              <div className="mb-3 bg-gray-50 border-2 border-gray-300 rounded-xl overflow-hidden">
                <ReactSketchCanvas
                  ref={canvasRef}
                  strokeWidth={drawingTool === 'pen' ? 4 : 20}
                  strokeColor={drawingTool === 'pen' ? '#000000' : '#FFFFFF'}
                  canvasColor="#F9FAFB"
                  height="200px"
                  className="w-full"
                  onChange={() => setHasDrawing(true)}
                />
              </div>

              {/* Text Input Below Canvas */}
              <div className="mb-3">
                <input
                  type="text"
                  value={writeNoteInput}
                  onChange={(e) => setWriteNoteInput(e.target.value)}
                  placeholder="Type your question or note…"
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-sm transition-all"
                  disabled={isLoading}
                />
              </div>

              {/* Canvas Controls */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDrawingTool('pen')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      drawingTool === 'pen'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <Pen className="h-4 w-4" />
                    Pen
                  </button>
                  <button
                    onClick={() => setDrawingTool('eraser')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      drawingTool === 'eraser'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <Eraser className="h-4 w-4" />
                    Eraser
                  </button>
                  <button
                    onClick={() => {
                      canvasRef.current?.clearCanvas();
                      setHasDrawing(false);
                    }}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 text-sm font-medium transition-all disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear
                  </button>
                </div>

                <button
                  onClick={handleCanvasSend}
                  disabled={isLoading || !hasDrawing}
                  className={`px-4 md:px-6 py-2 rounded-xl font-semibold text-sm md:text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
                    isLoading || !hasDrawing
                      ? 'bg-gray-400 text-white'
                      : `bg-gradient-to-r ${subject.gradient} text-white hover:shadow-lg transform hover:scale-105`
                  }`}
                >
                  <Send className="h-4 w-4 md:h-5 md:w-5" />
                  Send
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Draw your equation, add optional notes, then click Send
              </p>
            </motion.div>
          )}

          {/* Hidden File Inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
}
