import crypto from 'crypto';
import { prisma } from './prisma';

/**
 * Generate a hash for a question to detect duplicates
 * Normalizes the question text to catch similar questions
 */
export function hashQuestion(questionText: string): string {
  // Normalize: lowercase, remove extra spaces, remove punctuation
  const normalized = questionText
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ')    // Normalize spaces
    .trim();

  return crypto.createHash('md5').update(normalized).digest('hex');
}

/**
 * Save a generated question to history (Prisma)
 */
export async function saveGeneratedQuestion(data: {
  studentUserId: string;
  subject: string;
  topic: string;
  type: 'practice' | 'quiz';
  questionText: string;
  questionHash: string;
  answer?: string;
  hint?: string;
  options?: string[];
}) {
  return await prisma.generatedQuestion.create({
    data: {
      studentUserId: data.studentUserId,
      subject: data.subject,
      topic: data.topic,
      type: data.type.toUpperCase() as 'PRACTICE' | 'QUIZ',
      questionText: data.questionText,
      questionHash: data.questionHash,
      answer: data.answer,
      hint: data.hint,
      options: data.options || [],
    },
  });
}

/**
 * Get all question texts for a student to pass to AI for exclusion
 */
export async function getPreviousQuestions(
  studentUserId: string,
  subject: string,
  topics: string[]
): Promise<string[]> {
  const questions = await prisma.generatedQuestion.findMany({
    where: {
      studentUserId,
      subject,
      topic: {
        in: topics,
      },
    },
    select: {
      questionText: true,
    },
    orderBy: {
      generatedAt: 'desc',
    },
  });

  return questions.map(q => q.questionText);
}

/**
 * Save quiz results (Prisma)
 */
export async function saveQuizResult(data: {
  studentUserId: string;
  subject: string;
  topics: string[];
  totalScore: number;
  maxScore: number;
  percentage: number;
  elapsedTime: number;
  questionIds: string[];
}) {
  return await prisma.quizResult.create({
    data,
  });
}

/**
 * Get quiz history for a student (Prisma)
 */
export async function getQuizHistory(
  studentUserId: string,
  subject?: string
) {
  return await prisma.quizResult.findMany({
    where: {
      studentUserId,
      ...(subject ? { subject } : {}),
    },
    orderBy: {
      completedAt: 'desc',
    },
  });
}
