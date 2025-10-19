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
