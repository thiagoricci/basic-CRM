'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { QRCode } from '@/components/auth/qr-code';
import { BackupCodes } from '@/components/auth/backup-codes';
import { Shield, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function TwoFactorSetupPage() {
  const router = useRouter();
  const [step, setStep] = useState<'initial' | 'verify' | 'success'>('initial');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [secret, setSecret] = useState<string>('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');

  const handleEnable = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/auth/2fa/enable', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to enable 2FA');
      }

      setSecret(data.data.secret);
      setQrCodeUrl(data.data.qrCodeUrl);
      setBackupCodes(data.data.backupCodes);
      setStep('verify');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enable 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/auth/2fa/verify-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret, code: verificationCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify 2FA setup');
      }

      setSuccess('Two-factor authentication has been enabled successfully!');
      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify 2FA setup');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const handleComplete = () => {
    router.push('/settings/security');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Two-Factor Authentication Setup</CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 border-green-200 text-green-800">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {step === 'initial' && (
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">
                  Two-factor authentication (2FA) adds an extra layer of security to your account.
                  When enabled, you'll need to enter a code from your authenticator app
                  when signing in.
                </p>
                <div className="flex flex-wrap gap-2 justify-center text-xs text-gray-500">
                  <span>✓ Google Authenticator</span>
                  <span>✓ Authy</span>
                  <span>✓ Microsoft Authenticator</span>
                  <span>✓ 1Password</span>
                </div>
              </div>

              <Button
                onClick={handleEnable}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enabling...
                  </>
                ) : (
                  'Enable Two-Factor Authentication'
                )}
              </Button>

              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          )}

          {step === 'verify' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">Step 1: Scan QR Code</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Use your authenticator app to scan this QR code
                  </p>
                  <QRCode value={qrCodeUrl} size={256} />
                </div>

                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">Step 2: Verify Setup</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Enter the 6-digit code from your authenticator app to verify the setup
                  </p>
                  <div className="max-w-xs mx-auto space-y-2">
                    <Label htmlFor="verification-code">Verification Code</Label>
                    <Input
                      id="verification-code"
                      type="text"
                      placeholder="123456"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      maxLength={6}
                      className="text-center text-2xl tracking-widest"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <BackupCodes
                    codes={backupCodes}
                    showWarning={true}
                    onCopy={() => setSuccess('Codes copied to clipboard!')}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleVerify}
                  disabled={loading || verificationCode.length !== 6}
                  className="flex-1"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify and Enable'
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={loading}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="space-y-6 text-center">
              <div className="space-y-2">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold">2FA Enabled Successfully!</h3>
                <p className="text-sm text-gray-600">
                  Your account is now protected with two-factor authentication.
                  You'll need to enter a code from your authenticator app when signing in.
                </p>
              </div>

              <Button
                onClick={handleComplete}
                size="lg"
                className="w-full"
              >
                Continue to Security Settings
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
