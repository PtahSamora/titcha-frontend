import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { compare } from 'bcrypt';
import { prisma } from './prisma';
import { findUserByEmail } from './devdb';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        try {
          // Try Prisma database first (if DATABASE_URL is configured)
          let user = null;

          if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('xxxxx')) {
            user = await prisma.user.findUnique({
              where: { email: credentials.email },
            });

            if (user && user.password) {
              const isPasswordValid = await compare(credentials.password, user.password);
              if (isPasswordValid) {
                return {
                  id: user.id,
                  email: user.email || '',
                  name: user.name || '',
                  role: user.role,
                  image: user.image,
                };
              }
            }
          }

          // Fallback to devdb for development/testing
          const devUser = await findUserByEmail(credentials.email);
          if (!devUser) {
            throw new Error('No user found with this email');
          }

          const isPasswordValid = await compare(credentials.password, devUser.passwordHash);
          if (!isPasswordValid) {
            throw new Error('Invalid password');
          }

          return {
            id: devUser.id,
            email: devUser.email,
            name: devUser.displayName,
            role: devUser.role,
            schoolId: devUser.schoolId,
            meta: devUser.meta,
          };
        } catch (error) {
          console.error('Auth error:', error);
          throw new Error('Authentication failed');
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
        token.schoolId = (user as any).schoolId;
        token.meta = (user as any).meta;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
        (session.user as any).schoolId = token.schoolId;
        (session.user as any).meta = token.meta;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Role-based redirect helper
export function getRoleBasedRedirect(role: string): string {
  const redirects: Record<string, string> = {
    student: '/portal/student/dashboard',
    parent: '/portal/parent/dashboard',
    teacher: '/portal/teacher/dashboard',
    school: '/portal/school/dashboard',
    admin: '/portal/admin/dashboard',
  };
  return redirects[role] || '/';
}

// Helper to get session user in server components
export async function getSessionUser() {
  const { getServerSession } = await import('next-auth');
  const session = await getServerSession(authOptions);
  return session?.user ?? null;
}
