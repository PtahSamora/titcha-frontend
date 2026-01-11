// Type definitions for Titcha Platform

export type Role = 'student' | 'parent' | 'teacher' | 'school' | 'admin';

export interface User {
  id: string;
  role: Role;
  email: string;
  passwordHash: string;
  displayName: string;
  schoolId?: string;
  meta?: UserMeta;
  createdAt: string;
  updatedAt: string;
}

export interface UserMeta {
  grade?: string;
  childIds?: string[];
  teacherSubjects?: string[];
  theme?: 'student' | 'teacher' | 'school' | 'admin' | 'parent';
  colors?: {
    primary?: string;
    accent?: string;
  };
}

export interface School {
  id: string;
  name: string;
  region?: string;
  colors?: {
    primary?: string;
    accent?: string;
  };
}

export interface Class {
  id: string;
  schoolId: string;
  grade: string;
  name: string;
  teacherId?: string;
}

export interface Teacher {
  id: string;
  schoolId: string;
  name: string;
  subjects: string[];
}

export interface StudentProfile {
  id: string;
  userId: string;
  schoolId: string;
  grade: string;
  fullName: string;
}

export interface ParentProfile {
  id: string;
  userId: string;
  schoolId?: string;
  fullName: string;
  childUserIds?: string[];
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  createdAt: string;
}

// Student Portal Types
export interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
  progress: number;
  lastAccessed?: string;
}

export interface Homework {
  id: string;
  studentUserId: string;
  subject: string;
  title: string;
  description?: string;
  dueDate: string;
  status: 'pending' | 'done' | 'overdue';
  score?: number;
  completedAt?: string;
  createdAt: string;
}

export interface Friendship {
  id: string;
  aUserId: string; // User who sent the request
  bUserId: string; // User who received the request
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt?: string;
}

export interface DirectMessage {
  id: string;
  roomKey: string;
  fromUserId: string;
  toUserId: string;
  message: string;
  createdAt: string;
}

export interface StudyRoom {
  id: string;
  name: string;
  subject: string;
  ownerUserId: string;
  memberUserIds: string[];
  inviteCode: string;
  createdAt: string;
}

export interface RoomMessage {
  id: string;
  roomId: string;
  fromUserId: string;
  message: string;
  createdAt: string;
}

export interface RoomSnapshot {
  roomId: string;
  snapshot: any;
  updatedAt: string;
}

export interface RoomPermissions {
  roomId: string;
  askAiEnabled: boolean;
  memberAskAi: string[]; // userIds explicitly allowed when granular mode on
  updatedAt: string;
}

export interface RoomControl {
  roomId: string;
  controllerUserId: string | null; // userId who has exclusive Ask-AI control, null = no one
  updatedAt: string;
}

export interface ContinueActivity {
  id: string;
  studentUserId: string;
  type: 'lesson' | 'practice' | 'homework' | 'room';
  subject?: string;
  title: string;
  url?: string;
  progress?: number;
  lastAccessed: string;
}

export interface GeneratedQuestion {
  id: string;
  studentUserId: string;
  subject: string;
  topic: string;
  type: 'practice' | 'quiz';
  questionText: string;
  questionHash: string; // MD5 hash for deduplication
  answer?: string;
  hint?: string;
  options?: string[]; // For multiple choice
  generatedAt: string;
}

export interface QuizResult {
  id: string;
  studentUserId: string;
  subject: string;
  topics: string[];
  totalScore: number;
  maxScore: number;
  percentage: number;
  elapsedTime: number;
  completedAt: string;
  questions: string[]; // Question IDs
}

export interface GroupChat {
  id: string;
  name: string;
  ownerUserId: string;
  memberUserIds: string[];   // includes owner
  schoolId?: string;         // enforce same-school
  createdAt: string;
  updatedAt: string;
}

export interface GroupMessage {
  id: string;
  groupId: string;
  fromUserId: string;
  message: string;
  createdAt: string;
}

export interface Database {
  users: User[];
  schools: School[];
  classes: Class[];
  teachers: Teacher[];
  students: StudentProfile[];
  parents: ParentProfile[];
  sessions: any[];
  contactMessages: ContactMessage[];
  pendingLinks: any[];
  // Student Portal
  subjects: Subject[];
  homework: Homework[];
  friendships: Friendship[];
  dms: DirectMessage[];
  studyRooms: StudyRoom[];
  roomMessages: RoomMessage[];
  roomSnapshots: RoomSnapshot[];
  roomPermissions: RoomPermissions[];
  roomControls: RoomControl[];
  continueActivities: ContinueActivity[];
  groupChats: GroupChat[];
  groupMessages: GroupMessage[];
  generatedQuestions: GeneratedQuestion[];
  quizResults: QuizResult[];
}

// Safe user type without password hash
export type SafeUser = Omit<User, 'passwordHash'>;
