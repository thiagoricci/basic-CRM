'use client';

import { Book, Users, FileText, CheckSquare, Briefcase, LayoutDashboard, Code2, Webhook, Shield } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const docSections = [
  {
    category: 'Getting Started',
    items: [
      { href: '/docs', label: 'Overview', icon: Book },
    ],
  },
  {
    category: 'API Endpoints',
    items: [
      { href: '/docs/contacts', label: 'Contacts', icon: Users },
      { href: '/docs/activities', label: 'Activities', icon: FileText },
      { href: '/docs/tasks', label: 'Tasks', icon: CheckSquare },
      { href: '/docs/deals', label: 'Deals', icon: Briefcase },
      { href: '/docs/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    category: 'Integrations',
    items: [
      { href: '/docs/integration', label: 'Integration Examples', icon: Code2 },
      { href: '/docs/webhooks', label: 'Webhooks', icon: Webhook },
    ],
  },
  {
    category: 'Reference',
    items: [
      { href: '/docs/security', label: 'Security', icon: Shield },
    ],
  },
];

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container flex">
        {/* Sidebar Navigation */}
        <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col overflow-y-auto border-r bg-white/95 dark:bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:flex">
          {/* Logo Section */}
          <div className="flex items-center gap-3 border-b px-6 py-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <span className="text-lg font-bold text-primary-foreground">D</span>
            </div>
            <span className="text-2xl font-bold tracking-tight">Docs</span>
          </div>

          <nav className="flex-1 space-y-1 p-4">
            {docSections.map((section) => (
              <div key={section.category}>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {section.category}
                </h3>
                <ul className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
 
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={cn(
                            'group relative flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200',
                            isActive
                              ? 'bg-primary text-primary-foreground shadow-lg'
                              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                          )}
                        >
                          <Icon className={cn('h-5 w-5 transition-transform duration-200', isActive ? 'scale-110' : 'group-hover:scale-110')} />
                          <span>{item.label}</span>
                          {isActive && (
                            <div className="absolute right-2 h-2 w-2 rounded-full bg-primary-foreground" />
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="min-h-screen flex-1 md:ml-64">
          <div className="p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
