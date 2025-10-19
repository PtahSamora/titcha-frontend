import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { findUserById } from '@/lib/devdb';
import { NextRequest } from 'next/server';

export interface AuthUser {
  userId: string;
  role: string;
  email: string;
  displayName: string;
  schoolId?: string;
}

/**
 * Require authentication for API routes
 * @throws 401 if not authenticated
 * @returns Authenticated user info
 */
export async function requireUser(req?: NextRequest): Promise<AuthUser> {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    throw new Error('Unauthorized');
  }

  // Fetch full user details from database
  const user = await findUserById(session.user.id);

  if (!user) {
    throw new Error('User not found');
  }

  return {
    userId: user.id,
    role: user.role,
    email: user.email,
    displayName: user.displayName,
    schoolId: user.schoolId,
  };
}

/**
 * Require specific role
 * @throws 403 if wrong role
 */
export async function requireRole(role: string, req?: NextRequest): Promise<AuthUser> {
  const user = await requireUser(req);

  if (user.role !== role) {
    throw new Error('Forbidden: Insufficient permissions');
  }

  return user;
}

/**
 * Require same school
 * @throws 403 if different schools
 */
export async function requireSameSchool(userId: string, targetUserId: string): Promise<void> {
  const user = await findUserById(userId);
  const targetUser = await findUserById(targetUserId);

  if (!user || !targetUser) {
    throw new Error('User not found');
  }

  if (user.schoolId !== targetUser.schoolId) {
    throw new Error('Forbidden: Users must be from the same school');
  }
}

/**
 * Verify same school for multiple users
 * @throws 403 if any user is from different school
 */
export async function verifySameSchoolMultiple(userId: string, targetUserIds: string[]): Promise<void> {
  const user = await findUserById(userId);

  if (!user || !user.schoolId) {
    throw new Error('User not found or no school assigned');
  }

  for (const targetId of targetUserIds) {
    const targetUser = await findUserById(targetId);
    if (!targetUser || targetUser.schoolId !== user.schoolId) {
      throw new Error(`Forbidden: All users must be from the same school`);
    }
  }
}
