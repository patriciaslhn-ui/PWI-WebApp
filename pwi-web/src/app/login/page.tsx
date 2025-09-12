'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await login(email, password);
      window.location.href = '/'; // redirect after login
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '40px auto' }}>
      <h1>Login</h1><br></br>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit} className="form">
        <div>
          <label><b>Email</b></label><p></p>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label><b>Password</b></label><p></p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <br></br>
        <button type="submit">Log in</button>
        <a href=""><h4>Forgot Password?</h4></a>
      </form>
    </div>
  );
}
