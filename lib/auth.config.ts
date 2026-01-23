import type { NextAuthConfig } from 'next-auth';
import { prisma } from '@/lib/prisma';
import Credentials from 'next-auth/providers/credentials';
import type { UserRole } from '@/types/auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: UserRole;
    };
  }

  interface User {
    role: UserRole;
    twoFactorEnabled: boolean;
  }
}

export const authConfig: NextAuthConfig = {
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log('[Auth] Authorize called with:', {
          email: credentials?.email,
          hasPassword: !!credentials?.password,
        });

        if (!credentials?.email || !credentials?.password) {
          console.log('[Auth] Missing credentials');
          return null;
        }

        // @ts-ignore - Prisma types not yet generated
        const user = await (prisma as any).user.findUnique({
          where: { email: credentials.email as string },
        });

        console.log('[Auth] User lookup result:', user ? {
          id: user.id,
          email: user.email,
          isActive: user.isActive,
          emailVerified: user.emailVerified,
        } : 'User not found');

        if (!user || !user.isActive) {
          console.log('[Auth] User not found or inactive');
          return null;
        }

        // Check if email is verified
        if (!user.emailVerified) {
          console.log('[Auth] Email not verified');
          return null;
        }

        // Import bcrypt only on server side
        const bcrypt = (await import('bcrypt')).default;

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        console.log('[Auth] Password validation:', isPasswordValid);

        if (!isPasswordValid) {
          console.log('[Auth] Invalid password');
          return null;
        }

        console.log('[Auth] Authentication successful for:', user.email);
        
        // Check if 2FA is enabled
        if (user.twoFactorEnabled) {
          console.log('[Auth] 2FA is enabled, returning partial user data');
          // Return partial user data - 2FA verification will be handled separately
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role as UserRole,
            twoFactorEnabled: true,
          };
        }
        
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as UserRole,
          twoFactorEnabled: false,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.twoFactorEnabled = user.twoFactorEnabled;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
      }
      return session;
    },
  },
};
