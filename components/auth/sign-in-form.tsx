'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle } from 'lucide-react';
import { ResendVerificationButton } from './resend-verification-button';

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const checkEmail = searchParams.get('checkEmail');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [requiresEmailVerification, setRequiresEmailVerification] = useState(false);
  
  // Show success message if account was just created
  useEffect(() => {
    if (checkEmail === 'true') {
      setSuccessMessage('Account created successfully. Please check your email to verify your account before signing in.');
    }
  }, [checkEmail]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate email format before submitting
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('[SignIn] Attempting sign in with:', email);
      console.log('[SignIn] Password length:', password.length);
      
      // Call our custom sign-in API that checks credentials and returns 2FA status
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      console.log('[SignIn] API Response Status:', response.status);
      console.log('[SignIn] API Response OK:', response.ok);
      
      const data = await response.json();
      
      console.log('[SignIn] API Response Data:', data);
      console.log('[SignIn] Data Success:', data.data?.success);
      console.log('[SignIn] Two Factor Enabled:', data.data?.twoFactorEnabled);
      
      if (!response.ok || !data.data?.success) {
        console.log('[SignIn] Login failed. Error:', data.error);
        setError(data.error || 'Invalid email or password');
        setIsLoading(false);
        
        // Check if email verification is required
        if (data.requiresEmailVerification || data.data?.requiresEmailVerification) {
          setRequiresEmailVerification(true);
        }
        return;
      }
      
      console.log('[SignIn] API returned success. Checking 2FA...');
      
      // Check if 2FA is enabled
      if (data.data?.twoFactorEnabled) {
        console.log('[SignIn] 2FA enabled, redirecting to 2FA page');
        // Redirect to 2FA verification page
        router.push(`/auth/verify-2fa?callbackUrl=${encodeURIComponent(callbackUrl)}`);
        return;
      }
      
      console.log('[SignIn] 2FA not enabled. Calling NextAuth signIn...');
      
      // If 2FA is not enabled, complete sign-in with NextAuth
      const signInResult = await signIn('credentials', {
        email,
        password,
        redirect: true,
        callbackUrl,
      });
      
      console.log('[SignIn] NextAuth signIn result:', signInResult);
      
      // NextAuth will handle redirect automatically
    } catch (error) {
      console.log('[SignIn] Exception:', error);
      console.log('[SignIn] Exception stack:', error instanceof Error ? error.stack : 'No stack');
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
        <CardDescription>
          Enter your email and password to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {successMessage && (
          <div className="flex items-center gap-2 p-3 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 rounded-md mb-4">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-md">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          {requiresEmailVerification && (
            <div className="space-y-4">
              <ResendVerificationButton email={email} />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              autoComplete="email"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/auth/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              autoComplete="current-password"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              disabled={isLoading}
            />
            <Label
              htmlFor="remember"
              className="text-sm font-normal cursor-pointer"
            >
              Remember me
            </Label>
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <div className="text-sm">
          <span className="text-muted-foreground">Don't have an account? </span>
          <Link
            href="/auth/signup"
            className="text-primary hover:underline font-medium"
          >
            Sign up
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
