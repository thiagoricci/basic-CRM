import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppNavigation } from '@/components/layout/app-navigation';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'CRM Contact Manager',
  description: 'A lightweight, multi-user CRM system for managing customer contacts',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        <AppNavigation>{children}</AppNavigation>
      </body>
    </html>
  );
}
