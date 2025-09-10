'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { apiPost } from '@/lib/api';

export default function LoginPage() {
  const { setUser } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    try {
      const res = await apiPost<{ token: string; user: any }>('/auth/login', { email, password });
      localStorage.setItem('pwi_token', res.token);
      localStorage.setItem('pwi_user', JSON.stringify(res.user));
      setUser(res.user);
      router.replace('/');
    } catch (e: any) {
      setErr(e.message || 'Login failed');
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '40px auto' }}>
      <h1>Login</h1>
      <form onSubmit={handleSubmit} className="form">
        <div><label>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
        <div><label>Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} /></div>
        <button type="submit">Login</button>
      </form>
      {err && <p style={{ color: '#b00020' }}>{err}</p>}
    </div>
  );
}

