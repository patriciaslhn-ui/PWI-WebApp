'use client';
import { useAuth } from '@/lib/auth-context';
import { apiPost } from '@/lib/api';
import { useState } from 'react';

export default function LoginPage() {
  const { setUser } = useAuth();
  const [email, setEmail] = useState('staff@pwi.local'); // for convenience
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const { token, user } = await apiPost<{token:string; user:any}>('/auth/login', { email, password });
      localStorage.setItem('pwi_token', token);
      localStorage.setItem('pwi_user', JSON.stringify(user));
      setUser(user);
      window.location.href = '/';
    } catch (err: any) {
      setError(err?.message || 'Login failed');
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '80px auto' }}>
      <h1>Sign in</h1>
      <br></br>
      <p style={{ color:'#666' }}>Internal PWI webapp</p>
      <br></br>
      <hr></hr>
      <br></br>

      <form className="form" onSubmit={onSubmit}>
        <div>
          <label>Email </label>
          <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} />
        </div>
        <div>
          <label>Password </label>
          <input type="password" required value={password} onChange={e=>setPassword(e.target.value)} />
        </div>
        <br></br>
        <button type="submit">Login</button>
        {error && <div style={{ color:'#b00020' }}>{error}</div>}
      </form>

      <p style={{ fontSize:12, color:'#888', marginTop:12 }}>
        Demo users: <code>staff@pwi.local</code>, <code>sup@pwi.local</code>, <code>manager@pwi.local</code>, <code>director@pwi.local</code> — all with password <code>password</code>.
      </p>
    </div>
  );
}
