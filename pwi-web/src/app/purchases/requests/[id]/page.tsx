'use client';
import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '@/lib/api';
import RequireAuth from '@/components/RequireAuth';
import { useAuth } from '@/lib/auth-context';

type PR = {
  id: number;
  prNo: string;
  status: 'CREATED' | 'VALIDATED' | 'APPROVED' | 'REJECTED';
  requestedBy?: { id: number; name: string } | null;
  createdAt: string;
};

export default function PurchaseRequestDetail({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const [pr, setPR] = useState<PR | null>(null);
  const [err, setErr] = useState('');
  const id = Number(params.id);

  async function load() {
    try {
      const data = await apiGet<PR>(`/api/purchase-requests/${id}`);
      setPR(data);
    } catch (e: any) {
      setErr(e?.message || 'Failed to load PR');
    }
  }

  async function action(path: string) {
    try {
      await apiPost(`/api/purchase-requests/${id}/${path}`, {});
      await load();
    } catch (e: any) {
      alert(e?.message || `${path} failed`);
    }
  }

  useEffect(() => { load(); }, [id]);

  return (
    <RequireAuth>
      <div className="grid">
        <h1>Purchase Request #{pr?.prNo}</h1>
        {err && <p style={{ color: '#b00020' }}>{err}</p>}
        {!pr ? <p>Loading…</p> : (
          <div>
            <p><b>Status:</b> {pr.status}</p>
            <p><b>Requested By:</b> {pr.requestedBy?.name || '—'}</p>
            <p><b>Created:</b> {new Date(pr.createdAt).toLocaleString()}</p>
          </div>
        )}

        {/* Manager → Validate */}
        {pr && user?.level === 'MANAGER' && pr.status === 'CREATED' && (
          <div style={{ marginTop: 16 }}>
            <button onClick={() => action('validate')}>Validate</button>
          </div>
        )}

        {/* Director → Approve/Reject after validation */}
        {pr && user?.level === 'DIRECTOR' && pr.status === 'VALIDATED' && (
          <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
            <button onClick={() => action('approve')}>Approve</button>
            <button onClick={() => action('reject')}>Reject</button>
          </div>
        )}
      </div>
    </RequireAuth>
  );
}

