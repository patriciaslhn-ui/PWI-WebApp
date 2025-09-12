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

const divisionsList = ['MANUFACTURING','PURCHASING','SALES','FINANCE','LOGISTICS','WAREHOUSE_RM','WAREHOUSE_FG'];

export default function UserManagementPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (user?.level === 'DIRECTOR') {
      apiGet<User[]>('/api/users').then(setUsers).catch(console.error);
    }
  }, [user]);

  if (user?.level !== 'DIRECTOR') return <p>⛔ Access denied</p>;

  function updateLevel(userId: number, level: string) {
    apiPost(`/api/users/${userId}/set-level`, { level })
      .then(() => setUsers((prev) => prev.map(u => u.id === userId ? { ...u, level } : u)));
  }

  function updateDivisions(userId: number, divisions: string[]) {
    apiPost(`/api/users/${userId}/set-divisions`, { divisions })
      .then(() => setUsers((prev) => prev.map(u => u.id === userId ? { ...u, divisions } : u)));
  }

  return (
    <RequireAuth>
      <div style={{ padding: 20 }}>
        <h1>User Management</h1>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Email</th><th>Name</th><th>Level</th><th>Divisions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.email}</td>
                <td>{u.name}</td>
                <td>
                  <select value={u.level} onChange={(e) => updateLevel(u.id, e.target.value)}>
                    {['STAFF','SUPERVISOR','MANAGER','DIRECTOR'].map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </td>
                <td>
                  {divisionsList.map(d => (
                    <label key={d} style={{ display: 'block' }}>
                      <input
                        type="checkbox"
                        checked={u.divisions.includes(d)}
                        onChange={(e) => {
                          const newDivs = e.target.checked
                            ? [...u.divisions, d]
                            : u.divisions.filter(v => v !== d);
                          updateDivisions(u.id, newDivs);
                        }}
                      />
                      {d}
                    </label>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </RequireAuth>
  );
}
