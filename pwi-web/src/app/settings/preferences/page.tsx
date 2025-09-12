'use client';
import { useState } from 'react';
import { apiPost } from '@/lib/api';
import RequireAuth from '@/components/RequireAuth';
import { useAuth } from '@/lib/auth-context';

export default function UserPreferencesPage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await apiPost(`/api/users/${user?.id}/preferences`, { name, password });
      setMsg('✅ Preferences updated');
    } catch (err: any) {
      setMsg(`❌ ${err.message}`);
    }
  }

  return (
    <RequireAuth>
      <div style={{ maxWidth: 400, margin: '40px auto' }}>
        <h1>User Preferences</h1>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label>New Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit">Save</button>
        </form>
        {msg && <p>{msg}</p>}
      </div>
    </RequireAuth>
  );
}
