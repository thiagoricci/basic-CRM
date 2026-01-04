import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordStrengthProps {
  password: string;
}

interface Requirement {
  text: string;
  met: boolean;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const requirements: Requirement[] = [
    { text: 'At least 8 characters', met: password.length >= 8 },
    { text: 'At least 1 uppercase letter', met: /[A-Z]/.test(password) },
    { text: 'At least 1 lowercase letter', met: /[a-z]/.test(password) },
    { text: 'At least 1 number', met: /\d/.test(password) },
    { text: 'At least 1 special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];

  const metCount = requirements.filter((req) => req.met).length;
  const totalRequirements = requirements.length;

  const getStrengthLabel = () => {
    if (metCount === 0) return 'Enter password';
    if (metCount <= 2) return 'Weak';
    if (metCount <= 3) return 'Fair';
    if (metCount <= 4) return 'Good';
    return 'Strong';
  };

  const getStrengthColor = () => {
    if (metCount <= 2) return 'bg-red-500';
    if (metCount <= 3) return 'bg-yellow-500';
    if (metCount <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStrengthWidth = () => {
    return `${(metCount / totalRequirements) * 100}%`;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Password strength</span>
        <span className="text-sm font-medium">{getStrengthLabel()}</span>
      </div>
      <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className={cn('h-full transition-all duration-300', getStrengthColor())}
          style={{ width: getStrengthWidth() }}
        />
      </div>
      <ul className="space-y-2">
        {requirements.map((requirement, index) => (
          <li key={index} className="flex items-center gap-2 text-sm">
            {requirement.met ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <X className="h-4 w-4 text-slate-400" />
            )}
            <span
              className={cn(
                requirement.met ? 'text-green-700 dark:text-green-400' : 'text-slate-600 dark:text-slate-400'
              )}
            >
              {requirement.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
