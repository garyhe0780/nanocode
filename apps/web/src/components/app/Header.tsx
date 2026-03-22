import React from 'react';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  user: { email: string } | null;
  workspaceName?: string;
  onLogout: () => void;
}

export function Header({ user, workspaceName, onLogout }: HeaderProps) {
  return (
    <header className="h-14 border-b border-border/50 flex items-center">
      <div className="w-full max-w-5xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-base font-semibold tracking-tight">NanoDB</h1>
          {workspaceName && (
            <span className="text-muted-foreground/60">/ {workspaceName}</span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {user && (
            <span className="text-sm text-muted-foreground/60">{user.email}</span>
          )}
          <button
            onClick={onLogout}
            className="text-sm text-muted-foreground/60 hover:text-foreground transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
