'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Users, LayoutDashboard, Menu, X, FileText, CheckSquare, Briefcase, Building2, BarChart, LogIn, LogOut, User, ChevronDown, Settings, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { GlobalSearchBar } from '@/components/search/global-search-bar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/contacts', label: 'Contacts', icon: Users },
  { href: '/companies', label: 'Companies', icon: Building2 },
  { href: '/deals', label: 'Deals', icon: Briefcase },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/activities', label: 'Activities', icon: FileText },
  { href: '/reports', label: 'Reports', icon: BarChart },
  
];

const adminNavItems = [
  { href: '/admin/users', label: 'User Management', icon: Shield },
];

export function Navigation() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/signin' });
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 z-40 h-screen w-64 flex-col border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {/* Logo Section */}
        <div className="flex items-center gap-3 border-b px-6 py-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <span className="text-lg font-bold text-primary-foreground">C</span>
          </div>
          <span className="text-2xl font-bold tracking-tight">CRM</span>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <div key={item.href}>
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
              </div>
            );
          })}
          
          {/* Admin Navigation Items */}
          {session?.user?.role === 'admin' && (
            <>
              <div className="border-t my-2"></div>
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <div key={item.href}>
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
                  </div>
                );
              })}
            </>
          )}
        </nav>

        {/* Global Search */}
        <div className="border-t p-4">
          <GlobalSearchBar />
        </div>

        {/* User Section */}
        <div className="border-t p-4">
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex w-full items-center gap-3 rounded-lg p-3 hover:bg-accent transition-colors">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {session.user.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium">{session.user.name}</p>
                    <p className="text-xs text-muted-foreground">{session.user.email}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <p className="text-sm font-medium">{session.user.name}</p>
                  <p className="text-xs text-muted-foreground">{session.user.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth/signin">
              <button className="flex w-full items-center gap-3 rounded-lg p-3 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                <LogIn className="h-5 w-5" />
                <span className="text-sm font-medium">Sign In</span>
              </button>
            </Link>
          )}
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">C</span>
          </div>
          <span className="text-lg font-semibold tracking-tight">CRM</span>
        </div>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="rounded-lg p-2 hover:bg-accent hover:text-accent-foreground"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/50 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="fixed left-0 top-0 z-40 h-screen w-64 flex-col border-r bg-background md:hidden">
            {/* Mobile Logo */}
            <div className="flex items-center justify-between border-b px-6 py-6">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <span className="text-sm font-bold text-primary-foreground">C</span>
                </div>
                <span className="text-lg font-semibold tracking-tight">CRM</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-lg p-2 hover:bg-accent hover:text-accent-foreground"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile Navigation Items */}
            <nav className="flex-1 space-y-1 p-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              
              {/* Admin Navigation Items */}
              {session?.user?.role === 'admin' && adminNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Global Search */}
            <div className="border-t p-4">
              <GlobalSearchBar />
            </div>

            {/* Mobile User Section */}
            <div className="border-t p-4">
              {session ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 rounded-lg p-3 bg-muted/50">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {session.user.name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{session.user.name}</p>
                      <p className="text-xs text-muted-foreground">{session.user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-3 rounded-lg p-3 text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                    <span className="text-sm font-medium">Sign Out</span>
                  </button>
                </div>
              ) : (
                <Link href="/auth/signin" onClick={() => setIsMobileMenuOpen(false)}>
                  <button className="flex w-full items-center gap-3 rounded-lg p-3 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                    <LogIn className="h-5 w-5" />
                    <span className="text-sm font-medium">Sign In</span>
                  </button>
                </Link>
              )}
            </div>
          </aside>
        </>
      )}
    </>
  );
}
