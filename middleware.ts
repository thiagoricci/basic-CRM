// Middleware for authentication and route protection
// 
// NOTE: Middleware is currently disabled to allow NextAuth to work properly
// 
// ISSUE: Checking for session cookie in middleware creates a race condition
// where middleware checks for cookie before NextAuth can set it.
//
// SOLUTIONS FOR PHASE 3:
// 1. Use NextAuth's built-in middleware helper (recommended)
//    - Import { auth } from '@/app/api/auth/[...nextauth]/route'
//    - Use await auth() to validate sessions
//    - Requires moving auth config to separate file to avoid bcrypt import in edge runtime
//
// 2. Exclude NextAuth routes from middleware and use server-side session checks
//    - Add isAuthCallback check: request.nextUrl.pathname.startsWith('/api/auth/callback')
//    - Use requireAuth() helper in protected pages instead of middleware
//
// 3. Implement custom session validation without bcrypt
//    - Create separate auth validation that doesn't import authConfig
//    - Use JWT validation directly in middleware

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Allow all requests through - authentication is handled by NextAuth
  // Protected routes use requireAuth() helper on server side
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
