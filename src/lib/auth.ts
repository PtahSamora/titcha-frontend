import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcrypt';
import { findUserByEmail } from './devdb';

export const authOptions: NextAuthOptions = {
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
          // Find user in local file database
          const user = await findUserByEmail(credentials.email);

          if (!user) {
            throw new Error('No user found with this email');
          }

          // Verify password
          const isPasswordValid = await compare(credentials.password, user.passwordHash);

          if (!isPasswordValid) {
            throw new Error('Invalid password');
          }

          // Return user data for JWT
          return {
            id: user.id,
            email: user.email,
            name: user.displayName,
            role: user.role,
            schoolId: user.schoolId,
            meta: user.meta,
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
