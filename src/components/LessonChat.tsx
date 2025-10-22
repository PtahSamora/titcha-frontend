'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, BookOpen, Lightbulb, Target, HelpCircle } from 'lucide-react';
import { mockContextualResponse, extractLatexExpressions, type AIResponse } from '@/lib/mockOpenAI';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  structure?: AIResponse['structure'];
  timestamp: Date;
}

interface LessonChatProps {
  subject: string;
  topic: string;
}

const structureIcons = {
  explanation: BookOpen,
  example: Lightbulb,
  practice: Target,
  definition: HelpCircle,
  tip: Lightbulb,
};

const structureLabels = {
  explanation: 'Explanation',
  example: 'Example',
  practice: 'Practice',
  definition: 'Definition',
  tip: 'Tip',
};

const structureColors = {
  explanation: 'text-blue-600 bg-blue-50',
  example: 'text-yellow-600 bg-yellow-50',
  practice: 'text-green-600 bg-green-50',
  definition: 'text-purple-600 bg-purple-50',
  tip: 'text-orange-600 bg-orange-50',
};

export default function LessonChat({ subject, topic }: LessonChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: `Welcome to your ${subject} lesson on "${topic}"! I'm your AI tutor. Feel free to ask me anything about this topic, request examples, or ask for practice problems. How can I help you today?`,
      structure: 'explanation',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      role: 'user',
      text: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const reply = await mockContextualResponse(input, subject, topic);
      const assistantMsg: Message = {
        role: 'assistant',
        text: reply.text,
        structure: reply.structure,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMsg: Message = {
        role: 'assistant',
        text: 'Sorry, I encountered an error. Please try again.',
        structure: 'tip',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const renderMessageContent = (message: Message) => {
    const parts = extractLatexExpressions(message.text);

    return (
      <div className="space-y-2">
        {parts.map((part, idx) => {
          if (part.type === 'latex') {
            // Check if it's a simple inline expression or should be block
            const isBlock = part.content.includes('=') || part.content.length > 20;
            return (
              <div key={idx} className={isBlock ? 'my-3' : 'inline'}>
                {isBlock ? (
                  <BlockMath math={part.content} />
                ) : (
                  <InlineMath math={part.content} />
                )}
              </div>
            );
          }
          return (
            <span key={idx} className="whitespace-pre-wrap">
              {part.content}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 border-b">
        <div className="flex items-center gap-3">
          <Bot className="h-6 w-6" />
          <div>
            <h3 className="font-semibold text-lg">AI Tutor</h3>
            <p className="text-sm text-purple-100">
              {subject} • {topic}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50"
        style={{ scrollbarWidth: 'thin' }}
      >
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-3 ${
              message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            {/* Avatar */}
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-purple-100 text-purple-600'
              }`}
            >
              {message.role === 'user' ? (
                <User className="h-5 w-5" />
              ) : (
                <Bot className="h-5 w-5" />
              )}
            </div>

            {/* Message Bubble */}
            <div
              className={`flex-1 max-w-[75%] ${
                message.role === 'user' ? 'text-right' : 'text-left'
              }`}
            >
              {/* Structure Badge (for assistant messages) */}
              {message.role === 'assistant' && message.structure && (
                <div className="mb-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                      structureColors[message.structure]
                    }`}
                  >
                    {(() => {
                      const Icon = structureIcons[message.structure];
                      return <Icon className="h-3.5 w-3.5" />;
                    })()}
                    {structureLabels[message.structure]}
                  </span>
                </div>
              )}

              {/* Message Content */}
              <div
                className={`rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white border border-gray-200 text-gray-800'
                }`}
              >
                {renderMessageContent(message)}
              </div>

              {/* Timestamp */}
              <div className="text-xs text-gray-400 mt-1 px-2">
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
              <Bot className="h-5 w-5" />
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-sm text-gray-500">Tutor is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white p-4">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <textarea
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all"
              placeholder={`Ask about ${topic}...`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              rows={1}
              style={{ minHeight: '48px', maxHeight: '120px' }}
              disabled={isLoading}
            />
            <div className="text-xs text-gray-400 mt-1 px-2">
              Press Enter to send, Shift+Enter for new line
            </div>
          </div>
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="bg-purple-600 text-white rounded-xl px-6 py-3 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 font-medium shadow-md hover:shadow-lg"
          >
            <Send className="h-4 w-4" />
            Send
          </button>
        </div>
      </div>

      {/* Quick Prompts */}
      <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
        <div className="text-xs text-gray-500 mb-2">Quick prompts:</div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setInput('Can you explain this concept?')}
            className="text-xs bg-white border border-gray-200 rounded-full px-3 py-1.5 hover:bg-gray-100 transition-colors"
            disabled={isLoading}
          >
            Explain
          </button>
          <button
            onClick={() => setInput('Can you give me an example?')}
            className="text-xs bg-white border border-gray-200 rounded-full px-3 py-1.5 hover:bg-gray-100 transition-colors"
            disabled={isLoading}
          >
            Show Example
          </button>
          <button
            onClick={() => setInput('Can I try a practice problem?')}
            className="text-xs bg-white border border-gray-200 rounded-full px-3 py-1.5 hover:bg-gray-100 transition-colors"
            disabled={isLoading}
          >
            Practice
          </button>
        </div>
      </div>
    </div>
  );
}
