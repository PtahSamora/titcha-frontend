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
