import type { User as NextAuthUser, Session as NextAuthSession } from 'next-auth';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'rep';
  avatar?: string | null;
  bio?: string | null;
  isActive: boolean;
  emailVerified?: Date | null; // NEW
  twoFactorEnabled: boolean; // NEW
  twoFactorSecret?: string | null; // NEW
  lastSignInIp?: string | null; // NEW
  lastSignInAt?: Date | null; // NEW
  createdAt: Date;
  updatedAt: Date;
}

export interface Session extends NextAuthSession {
  user: User;
}

export interface Account {
  id: string;
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token?: string | null;
  access_token?: string | null;
  expires_at?: number | null;
  token_type?: string | null;
  scope?: string | null;
  id_token?: string | null;
  session_state?: string | null;
}

export interface VerificationToken {
  identifier: string;
  token: string;
  expires: Date;
}

export interface SignInHistory {
  id: string;
  userId: string;
  ipAddress: string;
  userAgent?: string | null;
  success: boolean;
  failureReason?: string | null;
  createdAt: Date;
}

export interface TwoFactorBackupCode {
  id: string;
  userId: string;
  code: string;
  used: boolean;
  createdAt: Date;
}

export type UserRole = 'admin' | 'manager' | 'rep';
