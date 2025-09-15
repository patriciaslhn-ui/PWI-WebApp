'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <header
        style={{
          background: '#f5f5f5',
          padding: '10px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
      </header>

      {/* Centered login card */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#f5f5f5',
        }}
      >
        <div
          style={{
            width: 400,
            padding: 30,
            border: '1px solid #ddd',
            borderRadius: 6,
            background: '#fff',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
          }}
        >
          <h1 style={{ textAlign: 'center', marginBottom: 20 }}>Login</h1>
          {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: 10,
                  marginTop: 4,
                  border: '1px solid #ccc',
                  borderRadius: 4,
                }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: 10,
                  marginTop: 4,
                  border: '1px solid #ccc',
                  borderRadius: 4,
                }}
              />
            </div>
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px',
                background: '#dbe9f4',
                border: '1px solid #ccc',
                borderRadius: 4,
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
            >
              LOG IN
            </button>
          </form>
          <p style={{ marginTop: 12, textAlign: 'center' }}>
            <Link
              href="/forgot-password"
              style={{ color: '#000', textDecoration: 'none' }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
            >
              Forgot Password?
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
