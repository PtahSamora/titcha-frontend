import { prisma } from './prisma';

/**
 * Calculate subject progress based on actual performance data
 * Returns percentage (0-100)
 */
export async function calculateSubjectProgress(
  studentUserId: string,
  subject: string
): Promise<number> {
  // Get all activity for this subject
  const [lessons, practices, quizzes] = await Promise.all([
    // Lesson progress
    prisma.lessonProgress.findMany({
      where: { studentUserId, subject },
    }),
    // Practice sessions
    prisma.practiceSession.findMany({
      where: { studentUserId, subject },
    }),
    // Quiz sessions
    prisma.quizSession.findMany({
      where: { studentUserId, subject, graded: true },
    }),
  ]);

  // Calculate metrics
  const completedLessons = lessons.filter(l => l.completed).length;
  const totalLessons = lessons.length || 1; // Avoid division by zero

  const completedPractices = practices.filter(p => p.completed).length;
  const totalPractices = practices.length || 1;

  const completedQuizzes = quizzes.length;
  const avgQuizScore = quizzes.length > 0
    ? quizzes.reduce((sum, q) => sum + (q.percentage || 0), 0) / quizzes.length
    : 0;

  // Weighted progress calculation
  // Lessons: 40%, Practice: 30%, Quiz: 30%
  const lessonProgress = (completedLessons / totalLessons) * 40;
  const practiceProgress = (completedPractices / totalPractices) * 30;
  const quizProgress = (avgQuizScore / 100) * 30;

  const totalProgress = lessonProgress + practiceProgress + quizProgress;

  return Math.round(Math.min(totalProgress, 100));
}

/**
 * Get overall stats for a student's subject
 */
export async function getSubjectStats(studentUserId: string, subject: string) {
  const [lessons, practices, quizzes] = await Promise.all([
    prisma.lessonProgress.findMany({
      where: { studentUserId, subject },
    }),
    prisma.practiceSession.findMany({
      where: { studentUserId, subject },
    }),
    prisma.quizSession.findMany({
      where: { studentUserId, subject, graded: true },
    }),
  ]);

  const totalPracticeScore = practices.reduce((sum, p) => sum + p.score, 0);
  const totalPracticeProblems = practices.reduce((sum, p) => sum + p.totalProblems, 0);

  return {
    lessonsStarted: lessons.length,
    lessonsCompleted: lessons.filter(l => l.completed).length,
    practiceSessionsCompleted: practices.filter(p => p.completed).length,
    practiceAccuracy: totalPracticeProblems > 0
      ? Math.round((totalPracticeScore / totalPracticeProblems) * 100)
      : 0,
    quizzesTaken: quizzes.length,
    averageQuizScore: quizzes.length > 0
      ? Math.round(quizzes.reduce((sum, q) => sum + (q.percentage || 0), 0) / quizzes.length)
      : 0,
  };
}

/**
 * Get progress for all subjects for a student
 */
export async function getAllSubjectsProgress(studentUserId: string) {
  // Get all unique subjects the student has interacted with
  const [lessonSubjects, practiceSubjects, quizSubjects] = await Promise.all([
    prisma.lessonProgress.findMany({
      where: { studentUserId },
      select: { subject: true },
      distinct: ['subject'],
    }),
    prisma.practiceSession.findMany({
      where: { studentUserId },
      select: { subject: true },
      distinct: ['subject'],
    }),
    prisma.quizSession.findMany({
      where: { studentUserId },
      select: { subject: true },
      distinct: ['subject'],
    }),
  ]);

  // Combine and deduplicate subjects
  const allSubjects = [
    ...new Set([
      ...lessonSubjects.map(l => l.subject),
      ...practiceSubjects.map(p => p.subject),
      ...quizSubjects.map(q => q.subject),
    ]),
  ];

  // Calculate progress for each subject
  const progressData = await Promise.all(
    allSubjects.map(async (subject) => ({
      subject,
      progress: await calculateSubjectProgress(studentUserId, subject),
    }))
  );

  return progressData;
}
