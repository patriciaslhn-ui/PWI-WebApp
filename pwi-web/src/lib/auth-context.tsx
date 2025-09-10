'use client';
import { createContext, useContext, useEffect, useState } from 'react';


export type User = { id:number; email:string; name?:string|null; level:'STAFF'|'SUPERVISOR'|'MANAGER'|'DIRECTOR' };


type AuthCtx = {
  user: User | null;
  ready: boolean;                 // ✅ auth state initialized
  setUser: (u: User | null) => void;
  logout: () => void;
};


const Ctx = createContext<AuthCtx>({
  user: null,
  ready: false,
  setUser: () => {},
  logout: () => {},
});


export function AuthProvider({ children }:{ children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);


  useEffect(() => {
    try {
      const raw = localStorage.getItem('pwi_user');
      if (raw) setUser(JSON.parse(raw));
    } finally {
      setReady(true); // ✅ only true after we've checked localStorage
    }
  }, []);


  function logout() {
    localStorage.removeItem('pwi_user');
    localStorage.removeItem('pwi_token');
    setUser(null);
    if (typeof window !== 'undefined') window.location.href = '/login';
  }


  return <Ctx.Provider value={{ user, ready, setUser, logout }}>{children}</Ctx.Provider>;
}


export function useAuth() { return useContext(Ctx); }

