import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';

export const { auth, handlers } = NextAuth(authConfig);
export const { GET, POST } = handlers;
