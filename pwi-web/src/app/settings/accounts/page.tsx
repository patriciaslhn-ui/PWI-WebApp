'use client';
import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '@/lib/api';
import RequireAuth from '@/components/RequireAuth';
import { useAuth } from '@/lib/auth-context';

type User = {
  id: number;
  email: string;
  name: string;
  level: string;
  divisions: string[];
};

export default function UserAccountsPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.level === 'DIRECTOR') {
      apiGet<User[]>('/api/users')
        .then(setUsers)
        .catch((e) => setError(e.message));
    }
  }, [user]);

  if (user?.level !== 'DIRECTOR') {
    return <p>⛔ Access denied</p>;
  }

  return (
    <RequireAuth>
      <div style={{ padding: 20 }}>
        <h1>User Accounts</h1>
        <br></br>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <table className='table' style={{ width: '100%', borderCollapse: 'collapse', textAlign:'left', padding: '8px', lineHeight: '1.5'}}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Level</th>
              <th>Divisions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.level}</td>
                <td>{u.divisions.join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* TODO: add Add/Delete buttons */}
      </div>
    </RequireAuth>
  );
}
