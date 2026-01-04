'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const hasVerified = useRef(false);

  useEffect(() => {
    async function verifyEmail() {
      // Prevent double verification (React Strict Mode)
      if (hasVerified.current) {
        console.log('[VerifyEmailPage] Already verified, skipping');
        return;
      }

      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link');
        return;
      }

      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`, {
          method: 'GET',
        });

        console.log('[VerifyEmailPage] Response status:', response.status);
        console.log('[VerifyEmailPage] Response ok:', response.ok);

        const data = await response.json();

        console.log('[VerifyEmailPage] Response data:', data);
        console.log('[VerifyEmailPage] data.error:', data.error);
        console.log('[VerifyEmailPage] data.data:', data.data);

        if (response.ok && data.error === null) {
          setStatus('success');
          setMessage(data.data.message);
        } else {
          setStatus('error');
          setMessage(data.error || 'Failed to verify email');
        }
      } catch (error) {
        console.error('[VerifyEmail] Error:', error);
        setStatus('error');
        setMessage('An error occurred while verifying your email');
      } finally {
        hasVerified.current = true;
      }
    }

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Email Verification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {status === 'loading' && (
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Verifying your email...
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <CheckCircle2 className="h-16 w-16 text-green-600" />
              <div className="text-center space-y-2">
                <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {message}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  You can now sign in to your account.
                </p>
              </div>
              <Button
                onClick={() => router.push('/auth/signin')}
                className="w-full"
                size="lg"
              >
                Go to Sign In
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <XCircle className="h-16 w-16 text-red-600" />
              <div className="text-center space-y-2">
                <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {message}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Please check the link or request a new verification email.
                </p>
              </div>
              <Button
                onClick={() => router.push('/auth/signin')}
                className="w-full"
                variant="outline"
                size="lg"
              >
                Back to Sign In
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
