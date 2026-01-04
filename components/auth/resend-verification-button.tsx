'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Mail } from 'lucide-react';

interface ResendVerificationButtonProps {
  email: string;
  onSent?: () => void;
}

export function ResendVerificationButton({
  email,
  onSent,
}: ResendVerificationButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(0);

  const handleResend = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.error === null) {
        setMessage('Verification email sent! Please check your inbox.');
        onSent?.();

        // Start countdown
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setMessage(data.error || 'Failed to send verification email');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={handleResend}
        disabled={isLoading || countdown > 0}
        variant="outline"
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : countdown > 0 ? (
          <>
            <Mail className="mr-2 h-4 w-4" />
            Resend in {countdown}s
          </>
        ) : (
          <>
            <Mail className="mr-2 h-4 w-4" />
            Resend Verification Email
          </>
        )}
      </Button>
      {message && (
        <p className="text-sm text-center text-slate-600 dark:text-slate-400">
          {message}
        </p>
      )}
    </div>
  );
}
