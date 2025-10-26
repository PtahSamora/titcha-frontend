/**
 * Simple in-memory store for quiz sessions
 * In production, this should be replaced with Redis or database storage
 */

interface QuizSession {
  subject: string;
  questions: any[];
  answers: any[];
  elapsedTime: number;
  timestamp: number;
  results?: any;
}

const quizStore = new Map<string, QuizSession>();

export function saveQuizSession(sessionId: string, data: QuizSession): void {
  quizStore.set(sessionId, data);
  console.log(`[Quiz Store] Saved session: ${sessionId}`);
}

export function getQuizSession(sessionId: string): QuizSession | undefined {
  return quizStore.get(sessionId);
}

export function deleteQuizSession(sessionId: string): boolean {
  const deleted = quizStore.delete(sessionId);
  if (deleted) {
    console.log(`[Quiz Store] Deleted session: ${sessionId}`);
  }
  return deleted;
}

export function saveQuizResults(sessionId: string, results: any): void {
  const session = quizStore.get(sessionId);
  if (session) {
    session.results = results;
    quizStore.set(sessionId, session);
    console.log(`[Quiz Store] Saved results for session: ${sessionId}`);
  }
}

// Generate unique session ID
export function generateSessionId(): string {
  return `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
