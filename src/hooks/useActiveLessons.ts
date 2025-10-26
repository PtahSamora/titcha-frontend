import { useState, useEffect } from 'react';

export interface ActiveLesson {
  topic: string;
  subject: string;
  url: string;
  lastAccessed: string;
}

const STORAGE_KEY = 'titcha_active_lessons';

export function getActiveLessons(): ActiveLesson[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading active lessons:', error);
    return [];
  }
}

export function saveActiveLessons(lessons: ActiveLesson[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lessons));
  } catch (error) {
    console.error('Error saving active lessons:', error);
  }
}

export function addLesson(lesson: ActiveLesson): void {
  const lessons = getActiveLessons();
  const existingIndex = lessons.findIndex(l => l.url === lesson.url);

  if (existingIndex !== -1) {
    // Update lastAccessed for existing lesson
    lessons[existingIndex].lastAccessed = lesson.lastAccessed;
  } else {
    // Add new lesson
    lessons.push(lesson);
  }

  saveActiveLessons(lessons);
}

export function updateLessonAccess(url: string): void {
  const lessons = getActiveLessons();
  const lesson = lessons.find(l => l.url === url);

  if (lesson) {
    lesson.lastAccessed = new Date().toISOString();
    saveActiveLessons(lessons);
  }
}

export function removeLesson(url: string): void {
  const lessons = getActiveLessons().filter(l => l.url !== url);
  saveActiveLessons(lessons);
}

export function clearAllLessons(): void {
  saveActiveLessons([]);
}

export function useActiveLessons() {
  const [lessons, setLessons] = useState<ActiveLesson[]>([]);

  useEffect(() => {
    setLessons(getActiveLessons());
  }, []);

  const refresh = () => {
    setLessons(getActiveLessons());
  };

  return {
    lessons,
    refresh,
    addLesson,
    removeLesson,
    updateLessonAccess,
    clearAllLessons,
  };
}

export function formatTimeAgo(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}
