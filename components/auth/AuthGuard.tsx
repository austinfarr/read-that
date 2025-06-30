'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAuth?: boolean;
}

export function AuthGuard({ children, fallback, requireAuth = false }: AuthGuardProps) {
  const { authUser, loading } = useAuth();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Give the auth state a moment to stabilize after loading completes
    if (!loading) {
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  // Show loading state
  if (loading || !isReady) {
    return fallback || (
      <div className="flex items-center justify-center p-4">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Check auth requirement
  if (requireAuth && !authUser) {
    return fallback || (
      <div className="flex items-center justify-center p-4">
        <div className="text-muted-foreground">Please sign in to continue</div>
      </div>
    );
  }

  return <>{children}</>;
}