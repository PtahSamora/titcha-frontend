/**
 * Merits System Utility
 *
 * Merit Rules:
 * - Quiz mark: 2 points per mark
 * - Practice problem mark: 1 point per mark
 * - Lesson completed: 0.5 points
 */

const STORAGE_KEY = 'titcha_merits';
const LOG_KEY = 'titcha_merit_log';

export interface MeritLogEntry {
  date: string;
  reason: string;
  points: number;
}

export function getTotalMerits(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? parseFloat(stored) : 0;
  } catch (error) {
    console.error('Error loading merits:', error);
    return 0;
  }
}

export function getMeritLog(): MeritLogEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(LOG_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading merit log:', error);
    return [];
  }
}

export function addMerits(points: number, reason: string): void {
  if (typeof window === 'undefined') return;

  try {
    // Update total merits
    const existing = getTotalMerits();
    const total = existing + points;
    localStorage.setItem(STORAGE_KEY, total.toFixed(1));

    // Add to log
    const log = getMeritLog();
    log.push({
      date: new Date().toISOString(),
      reason,
      points: parseFloat(points.toFixed(1)),
    });
    localStorage.setItem(LOG_KEY, JSON.stringify(log));

    console.log('[Merits] Added', points, 'points for:', reason, '| New total:', total.toFixed(1));
  } catch (error) {
    console.error('Error adding merits:', error);
  }
}

// Quiz merits: 2 points per mark
export function addQuizMerits(score: number, subject: string): void {
  const merits = score * 2;
  addMerits(merits, `Quiz: ${subject} (${score} marks)`);
}

// Practice merits: 1 point per mark
export function addPracticeMerits(score: number, subject: string, topic: string): void {
  const merits = score * 1;
  addMerits(merits, `Practice: ${topic} in ${subject} (${score} marks)`);
}

// Lesson completion merits: 0.5 points
export function addLessonCompletionMerits(subject: string, topic: string): void {
  const merits = 0.5;
  addMerits(merits, `Lesson Completed: ${topic} in ${subject}`);
}
