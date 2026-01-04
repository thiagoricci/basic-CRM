import { auth } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

export async function getSession() {
  return await auth();
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    redirect('/auth/signin');
  }
  return session;
}

export async function requireRole(role: 'admin' | 'manager' | 'rep') {
  const session = await requireAuth();
  if (session.user.role !== role) {
    redirect('/dashboard');
  }
  return session;
}
