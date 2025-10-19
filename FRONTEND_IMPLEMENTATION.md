# Educational AI Frontend - Complete Implementation Guide

This guide contains all code needed to build the role-based Next.js frontend.

## Project Structure

```
edu-ai-frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── api/auth/[...nextauth]/route.ts
│   │   ├── student/
│   │   │   └── dashboard/page.tsx
│   │   ├── teacher/
│   │   │   └── dashboard/page.tsx
│   │   └── admin/
│   │       └── dashboard/page.tsx
│   ├── components/
│   │   ├── ui/
│   │   ├── ChatBox.tsx
│   │   ├── FileUploader.tsx
│   │   ├── ProgressChart.tsx
│   │   ├── LessonCard.tsx
│   │   ├── Sidebar.tsx
│   │   └── TopNav.tsx
│   ├── lib/
│   │   ├── api.ts
│   │   ├── theme.ts
│   │   └── utils.ts
│   ├── types/
│   │   └── index.ts
│   └── hooks/
│       └── useAuth.ts
├── public/
└── tailwind.config.ts
```

## Setup Steps

```bash
cd edu-ai-frontend
npm install
cp .env.example .env
# Edit .env with your values
npm run dev
```

## 1. Core Configuration Files

### postcss.config.js

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### src/app/globals.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

## 2. Types (src/types/index.ts)

```typescript
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
}

export interface Student extends User {
  grade: string;
  school: string;
  learningLevel: string;
  preferredTone?: string;
}

export interface Teacher extends User {
  subject: string;
  style: string;
  tone?: string;
  language?: string;
}

export interface Lesson {
  id: string;
  topic: string;
  content: string;
  studentId: string;
  teacherId: string;
  createdAt: string;
  duration?: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
```

## 3. Theme System (src/lib/theme.ts)

```typescript
export const themes = {
  student: {
    primary: '#3B82F6',
    accent: '#22D3EE',
    bg: 'bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100',
    cardBg: 'bg-white/80 backdrop-blur-sm',
    text: 'text-gray-900',
  },
  teacher: {
    primary: '#10B981',
    accent: '#FACC15',
    bg: 'bg-gray-50',
    cardBg: 'bg-white',
    text: 'text-gray-900',
  },
  admin: {
    primary: '#111827',
    accent: '#F59E0B',
    bg: 'bg-gray-900',
    cardBg: 'bg-gray-800',
    text: 'text-gray-100',
  },
};

export type Role = keyof typeof themes;

export function getTheme(role: Role) {
  return themes[role];
}
```

## 4. API Client (src/lib/api.ts)

```typescript
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5100';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Student API
export const studentApi = {
  getProfile: (id: string) => api.get(`/api/student/${id}`),
  getProgress: (id: string) => api.get(`/api/student/${id}/progress`),
  create: (data: any) => api.post('/api/student', data),
};

// Teacher API
export const teacherApi = {
  getProfile: (id: string) => api.get(`/api/teacher/${id}`),
  create: (data: any) => api.post('/api/teacher', data),
  getAll: () => api.get('/api/teacher'),
};

// Lesson API
export const lessonApi = {
  generate: (data: { studentId: string; teacherId: string; topic: string; goal?: string }) =>
    api.post('/api/lesson/generate', data),
  getHistory: (filters?: any) => api.get('/api/lesson/history', { params: filters }),
};

// Chat API (for future AI chat)
export const chatApi = {
  sendMessage: (message: string, context: any) =>
    api.post('/api/chat', { message, context }),
};
```

## 5. Utility Functions (src/lib/utils.ts)

```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDuration(ms: number) {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ${seconds % 60}s`;
}
```

## 6. Root Layout (src/app/layout.tsx)

```typescript
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Educational AI Platform',
  description: 'Personalized learning with AI-powered lessons',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

## 7. Landing Page (src/app/page.tsx)

```typescript
'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { GraduationCap, Users, Shield } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  const roles = [
    {
      id: 'student',
      title: 'Student',
      description: 'Learn with personalized AI tutoring',
      icon: GraduationCap,
      color: 'from-blue-500 to-cyan-500',
      path: '/student/dashboard',
    },
    {
      id: 'teacher',
      title: 'Teacher',
      description: 'Create adaptive lessons for your students',
      icon: Users,
      color: 'from-green-500 to-emerald-500',
      path: '/teacher/dashboard',
    },
    {
      id: 'admin',
      title: 'Admin',
      description: 'Manage platform and analytics',
      icon: Shield,
      color: 'from-gray-700 to-gray-900',
      path: '/admin/dashboard',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-6xl font-bold text-gray-900 mb-4">
            Educational AI Platform
          </h1>
          <p className="text-xl text-gray-600">
            Personalized learning powered by artificial intelligence
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {roles.map((role, index) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="cursor-pointer"
              onClick={() => router.push(role.path)}
            >
              <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow">
                <div className={`w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br ${role.color} flex items-center justify-center`}>
                  <role.icon className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{role.title}</h2>
                <p className="text-gray-600">{role.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

## 8. Student Dashboard (src/app/student/dashboard/page.tsx)

```typescript
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Upload, TrendingUp, BookOpen } from 'lucide-react';
import ChatBox from '@/components/ChatBox';
import FileUploader from '@/components/FileUploader';
import ProgressChart from '@/components/ProgressChart';
import LessonCard from '@/components/LessonCard';
import { studentApi, lessonApi } from '@/lib/api';

export default function StudentDashboard() {
  const [lessons, setLessons] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    // Load lesson history
    lessonApi.getHistory({ studentId: 'demo-student' }).then((res) => {
      setLessons(res.data.slice(0, 5));
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100">
      {/* Top Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-blue-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">Student Portal</h1>
          <div className="flex gap-4">
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              Profile
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-2">Welcome back!</h2>
          <p className="text-gray-600">Ready to continue your learning journey?</p>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setShowChat(true)}
            className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
          >
            <MessageSquare className="w-8 h-8 text-blue-500 mb-2" />
            <h3 className="font-semibold text-gray-900">Ask AI Tutor</h3>
            <p className="text-sm text-gray-600">Get instant help</p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setShowUpload(true)}
            className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
          >
            <Upload className="w-8 h-8 text-cyan-500 mb-2" />
            <h3 className="font-semibold text-gray-900">Upload Work</h3>
            <p className="text-sm text-gray-600">Get AI feedback</p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
          >
            <TrendingUp className="w-8 h-8 text-green-500 mb-2" />
            <h3 className="font-semibold text-gray-900">My Progress</h3>
            <p className="text-sm text-gray-600">Track improvements</p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
          >
            <BookOpen className="w-8 h-8 text-purple-500 mb-2" />
            <h3 className="font-semibold text-gray-900">Lessons</h3>
            <p className="text-sm text-gray-600">Browse content</p>
          </motion.button>
        </div>

        {/* Progress Chart */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Learning Progress</h3>
          <ProgressChart />
        </div>

        {/* Recent Lessons */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Lessons</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {lessons.map((lesson: any) => (
              <LessonCard key={lesson.id} lesson={lesson} />
            ))}
          </div>
        </div>
      </div>

      {/* Chat Modal */}
      {showChat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <ChatBox onClose={() => setShowChat(false)} />
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6">
            <FileUploader onClose={() => setShowUpload(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
```

## 9. Core Components

### ChatBox Component (src/components/ChatBox.tsx)

```typescript
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X } from 'lucide-react';
import { Message } from '@/types';

interface ChatBoxProps {
  onClose: () => void;
}

export default function ChatBox({ onClose }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI tutor. How can I help you today?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I understand your question. Let me help you with that...',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="text-lg font-semibold">AI Tutor</h3>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {message.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-gray-100 p-3 rounded-lg">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me anything..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSend}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
```

### FileUploader Component (src/components/FileUploader.tsx)

```typescript
'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface FileUploaderProps {
  onClose: () => void;
}

export default function FileUploader({ onClose }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
  });

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    // Simulate upload
    setTimeout(() => {
      setResult({
        score: 85,
        feedback: 'Great work! Your understanding is clear.',
      });
      setUploading(false);
    }, 2000);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Upload Your Work</h3>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
          <X className="w-5 h-5" />
        </button>
      </div>

      {!result ? (
        <>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-blue-400'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            {file ? (
              <div className="flex items-center justify-center gap-2">
                <FileText className="w-5 h-5" />
                <span>{file.name}</span>
              </div>
            ) : (
              <div>
                <p className="text-gray-600">
                  {isDragActive
                    ? 'Drop the file here'
                    : 'Drag & drop a file here, or click to select'}
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Supports: Images, PDFs
                </p>
              </div>
            )}
          </div>

          {file && (
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 transition-colors"
            >
              {uploading ? 'Uploading...' : 'Upload & Analyze'}
            </button>
          )}
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h4 className="text-xl font-bold mb-2">Analysis Complete!</h4>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-3xl font-bold text-blue-600 mb-2">
              {result.score}%
            </p>
            <p className="text-gray-600">{result.feedback}</p>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Done
          </button>
        </motion.div>
      )}
    </div>
  );
}
```

### Progress Chart (src/components/ProgressChart.tsx)

```typescript
'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Week 1', score: 65 },
  { name: 'Week 2', score: 72 },
  { name: 'Week 3', score: 78 },
  { name: 'Week 4', score: 85 },
  { name: 'Week 5', score: 88 },
];

export default function ProgressChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="score"
          stroke="#3B82F6"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

### Lesson Card (src/components/LessonCard.tsx)

```typescript
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
```

## Teacher Dashboard (Simplified)

Create `src/app/teacher/dashboard/page.tsx`:

```typescript
'use client';

import { motion } from 'framer-motion';
import { Upload, Users, BarChart, Settings } from 'lucide-react';

export default function TeacherDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-green-600">Teacher Portal</h1>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <h2 className="text-4xl font-bold text-gray-900 mb-8">Teacher Dashboard</h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white p-6 rounded-xl shadow-lg"
          >
            <Upload className="w-8 h-8 text-green-500 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Upload Syllabus</h3>
            <p className="text-sm text-gray-600">Add course materials</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white p-6 rounded-xl shadow-lg"
          >
            <Users className="w-8 h-8 text-blue-500 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">My Students</h3>
            <p className="text-sm text-gray-600">Manage class roster</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white p-6 rounded-xl shadow-lg"
          >
            <BarChart className="w-8 h-8 text-purple-500 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Analytics</h3>
            <p className="text-sm text-gray-600">Class performance</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white p-6 rounded-xl shadow-lg"
          >
            <Settings className="w-8 h-8 text-gray-500 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Persona Config</h3>
            <p className="text-sm text-gray-600">Teaching style</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
```

## Admin Dashboard (Simplified)

Create `src/app/admin/dashboard/page.tsx`:

```typescript
'use client';

import { motion } from 'framer-motion';
import { Activity, Users, Server, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-amber-500">Admin Portal</h1>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <h2 className="text-4xl font-bold mb-8">System Dashboard</h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700"
          >
            <Activity className="w-8 h-8 text-amber-500 mb-3" />
            <h3 className="font-semibold mb-1">System Status</h3>
            <p className="text-2xl font-bold text-green-400">Online</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700"
          >
            <Users className="w-8 h-8 text-blue-500 mb-3" />
            <h3 className="font-semibold mb-1">Total Users</h3>
            <p className="text-2xl font-bold">1,234</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700"
          >
            <Server className="w-8 h-8 text-purple-500 mb-3" />
            <h3 className="font-semibold mb-1">API Calls</h3>
            <p className="text-2xl font-bold">45.2K</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700"
          >
            <TrendingUp className="w-8 h-8 text-green-500 mb-3" />
            <h3 className="font-semibold mb-1">Growth</h3>
            <p className="text-2xl font-bold text-green-400">+23%</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
```

## Quick Start

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env`
3. Run development server: `npm run dev`
4. Open http://localhost:3000

The frontend is now ready to connect to the App-Logic Node (port 5100)!
