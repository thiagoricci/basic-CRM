'use server';

import { auth } from '@/lib/auth-instance';

export async function getCurrentUser() {
  const session = await auth();
  return session?.user || null;
}

export async function getSession() {
  return await auth();
}
