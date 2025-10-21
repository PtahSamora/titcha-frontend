import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { prisma } from './prisma';
import { findUserByEmail } from './devdb';

export const authOptions: NextAuthOptions = {
  // Note: PrismaAdapter is NOT compatible with CredentialsProvider + JWT sessions
  // We use JWT sessions for credentials-based auth
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please provide email and password');
        }

        // Try Prisma database first (if DATABASE_URL is configured)
        if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('xxxxx')) {
          try {
            console.log('[Auth] Attempting Prisma authentication for:', credentials.email);
            const user = await prisma.user.findUnique({
              where: { email: credentials.email },
            });

            console.log('[Auth] Prisma user lookup result:', user ? 'Found' : 'Not found');

            if (!user) {
              throw new Error('No account found with this email');
            }

            if (!user.password) {
              throw new Error('Password not set for this account');
            }

            const isPasswordValid = await compare(credentials.password, user.password);
            console.log('[Auth] Password validation:', isPasswordValid ? 'Valid' : 'Invalid');

            if (!isPasswordValid) {
              throw new Error('Incorrect password');
            }

            console.log('[Auth] Authentication successful via Prisma');
            return {
              id: user.id,
              email: user.email || '',
              name: user.name || '',
              role: user.role,
              image: user.image,
            };
          } catch (error: any) {
            console.error('[Auth] Prisma authentication error:', error.message, error.code);

            // If it's a known error, rethrow it
            if (error.message.includes('No account found') ||
                error.message.includes('Incorrect password') ||
                error.message.includes('Password not set')) {
              throw error;
            }

            // If it's a database connection error, fall through to devdb
            console.log('[Auth] Prisma connection failed, falling back to devdb');
          }
        }

        // Fallback to devdb for development/testing
        try {
          console.log('[Auth] Attempting devdb authentication for:', credentials.email);
          const devUser = await findUserByEmail(credentials.email);
          console.log('[Auth] Devdb user lookup result:', devUser ? 'Found' : 'Not found');

          if (!devUser) {
            throw new Error('No account found with this email');
          }

          const isPasswordValid = await compare(credentials.password, devUser.passwordHash);
          console.log('[Auth] Devdb password validation:', isPasswordValid ? 'Valid' : 'Invalid');

          if (!isPasswordValid) {
            throw new Error('Incorrect password');
          }

          console.log('[Auth] Authentication successful via devdb');
          return {
            id: devUser.id,
            email: devUser.email,
            name: devUser.displayName,
            role: devUser.role,
            schoolId: devUser.schoolId,
            meta: devUser.meta,
          };
        } catch (error: any) {
          console.error('[Auth] Final authentication error:', error.message);
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      console.log('[JWT Callback] Trigger:', trigger, 'User:', user ? 'Present' : 'Missing');
      if (user) {
        console.log('[JWT Callback] Adding user data to token:', { id: user.id, role: (user as any).role });
        token.role = (user as any).role;
        token.id = user.id;
        token.schoolId = (user as any).schoolId;
        token.meta = (user as any).meta;
      }
      console.log('[JWT Callback] Token being returned:', { id: token.id, role: token.role });
      return token;
    },
    async session({ session, token }) {
      console.log('[Session Callback] Creating session from token:', { id: token.id, role: token.role });
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
        (session.user as any).schoolId = token.schoolId;
        (session.user as any).meta = token.meta;
      }
      console.log('[Session Callback] Session created:', { userId: (session.user as any)?.id, role: (session.user as any)?.role });
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true, // Enable debug mode to see detailed logs
  useSecureCookies: process.env.NODE_ENV === 'production',
};

// Role-based redirect helper
export function getRoleBasedRedirect(role: string): string {
  // Normalize role to uppercase for consistent matching
  const normalizedRole = role?.toUpperCase();

  const redirects: Record<string, string> = {
    STUDENT: '/portal/student/dashboard',
    PARENT: '/portal/parent/dashboard',
    TEACHER: '/portal/teacher/dashboard',
    SCHOOL: '/portal/school/dashboard',
    ADMIN: '/portal/admin/dashboard',
  };
  return redirects[normalizedRole] || '/';
}

// Helper to get session user in server components
export async function getSessionUser() {
  const { getServerSession } = await import('next-auth');
  const session = await getServerSession(authOptions);
  return session?.user ?? null;
}
