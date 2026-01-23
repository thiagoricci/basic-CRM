'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EmailVerificationStatus } from '@/components/auth/email-verification-status';
import { ResendVerificationButton } from '@/components/auth/resend-verification-button';
import { getCurrentUser } from '@/lib/actions';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setIsLoading(false);
    }
    loadUser();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="h-8 w-8" />
          Account Settings
        </h1>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Email Verification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Email Address</Label>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {user?.email}
              </p>
            </div>
            <EmailVerificationStatus
              isVerified={!!user?.emailVerified}
            />
          </div>

          {!user?.emailVerified && (
            <div className="pt-4 border-t">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Your email is not verified. Please verify your email to access all features.
              </p>
              <ResendVerificationButton email={user?.email} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add more settings sections as needed */}
    </div>
  );
}
