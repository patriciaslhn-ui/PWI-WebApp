'use client';
import { createContext, useContext, useEffect, useState } from 'react';

export type User = { id:number; email:string; name?:string|null; level:'STAFF'|'SUPERVISOR'|'MANAGER'|'DIRECTOR' };

type AuthCtx = {
  user: User | null;
  setUser: (u: User | null) => void;
  logout: () => void;
};

const Ctx = createContext<AuthCtx>({ user: null, setUser: () => {}, logout: () => {} });

export function AuthProvider({ children }:{ children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem('pwi_user');
    if (raw) setUser(JSON.parse(raw));
  }, []);

  function logout() {
    localStorage.removeItem('pwi_user');
    localStorage.removeItem('pwi_token');
    setUser(null);
    window.location.href = '/login';
  }

  return <Ctx.Provider value={{ user, setUser, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() { return useContext(Ctx); }
