'use client';
import { useAuth } from '@/lib/auth-context';
import { useEffect } from 'react';

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/login';
    }
  }, [loading, user]);

  if (loading) {
    return <p>Loading session…</p>; // ⏳ wait for localStorage check
  }

  if (!user) {
    return <p>Redirecting to login…</p>;
  }

  return <>{children}</>;
}
