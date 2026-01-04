'use client';

import { usePathname } from 'next/navigation';
import { Navigation } from './navigation';
import { cn } from '@/lib/utils';

export function AppNavigation({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDocsPage = pathname?.startsWith('/docs');
  const isAuthPage = pathname?.startsWith('/auth');

  return (
    <>
      {!isDocsPage && !isAuthPage && <Navigation />}
      <main className={cn('min-h-screen bg-background', !isDocsPage && !isAuthPage && 'md:pl-64')}>
        {children}
      </main>
    </>
  );
}
