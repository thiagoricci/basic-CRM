'use client';

import { CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface EmailVerificationStatusProps {
  isVerified: boolean;
  email?: string;
}

export function EmailVerificationStatus({
  isVerified,
  email,
}: EmailVerificationStatusProps) {
  if (isVerified) {
    return (
      <Badge variant="outline" className="gap-1 border-green-500 text-green-700 dark:text-green-400">
        <CheckCircle2 className="h-3 w-3" />
        Verified
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="gap-1 border-amber-500 text-amber-700 dark:text-amber-400">
      <AlertCircle className="h-3 w-3" />
      Not Verified
    </Badge>
  );
}
