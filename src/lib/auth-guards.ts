import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { findUserById, findUserByEmail, readDB, writeDB } from '@/lib/devdb';
import { NextRequest } from 'next/server';

export interface AuthUser {
  userId: string;
  role: string;
  email: string;
  displayName: string;
  schoolId?: string;
}

/**
 * Sync Prisma user to devdb for study groups compatibility
 */
async function syncUserToDevDB(prismaUser: any): Promise<void> {
  try {
    const db = await readDB();

    // Check if user already exists in devdb (by email)
    const existingUser = db.users.find(u => u.email.toLowerCase() === prismaUser.email?.toLowerCase());

    if (!existingUser) {
      // Add user to devdb
      const devUser = {
        id: prismaUser.id,
        email: prismaUser.email || '',
        passwordHash: '', // Not needed since they're authenticated via Prisma
        displayName: prismaUser.name || prismaUser.email || 'User',
        role: prismaUser.role.toLowerCase() as 'student' | 'teacher' | 'parent',
        schoolId: undefined,
        meta: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      db.users.push(devUser);
      await writeDB(db);
      console.log('[Auth] Synced Prisma user to devdb:', prismaUser.email);
    }
  } catch (error) {
    console.error('[Auth] Failed to sync user to devdb:', error);
    // Don't throw - this is not critical for authentication
  }
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

  // Try Prisma first, then fallback to devdb
  let user = null;

  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('xxxxx')) {
    user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (user) {
      // Sync to devdb for study groups compatibility
      await syncUserToDevDB(user);

      return {
        userId: user.id,
        role: user.role,
        email: user.email || '',
        displayName: user.name || '',
        schoolId: undefined, // Not stored in Prisma schema yet
      };
    }
  }

  // Fallback to devdb
  const devUser = await findUserById(session.user.id);

  if (!devUser) {
    throw new Error('User not found');
  }

  return {
    userId: devUser.id,
    role: devUser.role,
    email: devUser.email,
    displayName: devUser.displayName,
    schoolId: devUser.schoolId,
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
