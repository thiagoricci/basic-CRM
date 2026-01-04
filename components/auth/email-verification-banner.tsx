'use client';

import { AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ResendVerificationButton } from './resend-verification-button';

interface EmailVerificationBannerProps {
  email: string;
  onDismiss?: () => void;
}

export function EmailVerificationBanner({
  email,
  onDismiss,
}: EmailVerificationBannerProps) {
  return (
    <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div>
              <h3 className="font-semibold text-amber-900 dark:text-amber-100">
                Verify Your Email Address
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                Please verify your email to access all features. Check your inbox for verification link.
              </p>
            </div>
            <ResendVerificationButton email={email} />
          </div>
        </div>
        {onDismiss && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onDismiss}
            className="h-6 w-6 flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
