'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Copy, Check, AlertTriangle } from 'lucide-react';

interface BackupCodesProps {
  codes: string[];
  onCopy?: () => void;
  showWarning?: boolean;
}

export function BackupCodes({ codes, onCopy, showWarning = true }: BackupCodesProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    onCopy?.();
  };

  const handleCopyAll = () => {
    const allCodes = codes.join('\n');
    navigator.clipboard.writeText(allCodes);
    onCopy?.();
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {showWarning && (
          <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium text-yellow-800">Save these backup codes</p>
              <p className="text-sm text-yellow-700">
                These codes can be used to sign in if you lose access to your authenticator app.
                Each code can only be used once. Store them securely and never share them.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Backup Codes</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyAll}
              className="text-xs"
            >
              Copy All
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            {codes.map((code, index) => (
              <div
                key={index}
                className="relative group"
              >
                <button
                  onClick={() => handleCopy(code, index)}
                  className="w-full p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-sm font-mono tracking-wider transition-colors"
                >
                  <div className="flex items-center justify-center gap-2">
                    {copiedIndex === index ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                    )}
                    <span className="break-all">{code}</span>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs text-gray-500">
          <p>• Each code can only be used once</p>
          <p>• Store them in a secure location</p>
          <p>• Regenerate codes if you suspect they've been compromised</p>
        </div>
      </div>
    </Card>
  );
}
