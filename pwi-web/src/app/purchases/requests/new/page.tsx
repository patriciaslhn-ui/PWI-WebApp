'use client';
import { useState } from 'react';
import { apiPost } from '@/lib/api';
import RequireAuth from '@/components/RequireAuth';

export default function NewPurchaseRequestPage() {
  const [prNo, setPrNo] = useState(`PR-${Date.now()}`);
  const [err, setErr] = useState('');
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    try {
      await apiPost('/api/purchase-requests', { prNo });
      setDone(true);
    } catch (e: any) {
      setErr(e?.message || 'Failed to create PR');
    }
  }

  if (done) return <p>✅ Purchase Request created!</p>;

  return (
    <RequireAuth>
      <div className="grid">
        <h1>New Purchase Request</h1>
        <form onSubmit={submit} className="form">
          <div>
            <label>PR No</label>
            <input value={prNo} onChange={e => setPrNo(e.target.value)} />
          </div>
          <button type="submit">Create PR</button>
        </form>
        {err && <p style={{ color: '#b00020' }}>{err}</p>}
      </div>
    </RequireAuth>
  );
}
