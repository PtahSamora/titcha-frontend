import { z } from 'zod';

// Login validation
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginInput = z.infer<typeof loginSchema>;

// Student registration
export const registerStudentSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  fullName: z.string().min(2, 'Full name is required'),
  schoolId: z.string().min(1, 'Please select a school'),
  grade: z.string().min(1, 'Please select a grade'),
  theme: z.enum(['student', 'teacher', 'school', 'admin', 'parent']).optional(),
  colors: z.object({
    primary: z.string().optional(),
    accent: z.string().optional(),
  }).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export type RegisterStudentInput = z.infer<typeof registerStudentSchema>;

// Parent registration
export const registerParentSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  fullName: z.string().min(2, 'Full name is required'),
  schoolId: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export type RegisterParentInput = z.infer<typeof registerParentSchema>;

// Teacher registration
export const registerTeacherSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  fullName: z.string().min(2, 'Full name is required'),
  schoolId: z.string().min(1, 'Please select a school'),
  subjects: z.array(z.string()).min(1, 'Please select at least one subject'),
  theme: z.enum(['student', 'teacher', 'school', 'admin', 'parent']).optional(),
  colors: z.object({
    primary: z.string().optional(),
    accent: z.string().optional(),
  }).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export type RegisterTeacherInput = z.infer<typeof registerTeacherSchema>;

// School registration
export const registerSchoolSchema = z.object({
  schoolName: z.string().min(2, 'School name is required'),
  region: z.string().optional(),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  adminName: z.string().min(2, 'Admin name is required'),
  colors: z.object({
    primary: z.string().optional(),
    accent: z.string().optional(),
  }).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export type RegisterSchoolInput = z.infer<typeof registerSchoolSchema>;

// Contact form validation
export const contactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  subject: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export type ContactInput = z.infer<typeof contactSchema>;
