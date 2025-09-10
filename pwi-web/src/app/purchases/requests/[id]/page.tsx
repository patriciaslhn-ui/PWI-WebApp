'use client';
import { use } from 'react';
import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '@/lib/api';
import RequireAuth from '@/components/RequireAuth';
import { useAuth } from '@/lib/auth-context';

type PR = {
  id: number;
  prNo: string;
  status: 'CREATED' | 'APPROVED' | 'REJECTED';
  requestedBy?: { id: number; name: string } | null;
  createdAt: string;
};

export default function PurchaseRequestDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);             // ✅ unwrap the params Promise
  const prId = Number(id);
  const { user } = useAuth();
  const [pr, setPR] = useState<PR | null>(null);
  const [err, setErr] = useState('');

  async function load() {
    try {
      const data = await apiGet<PR>(`/api/purchase-requests/${prId}`);
      setPR(data);
    } catch (e: any) {
      setErr(e?.message || 'Failed to load PR');
    }
  }

  async function approve() {
    await apiPost(`/api/purchase-requests/${prId}/approve`, { supplierId: 1 }); // TODO: let staff pick supplier
    await load();
  }

  async function reject() {
    await apiPost(`/api/purchase-requests/${prId}/reject`, {});
    await load();
  }

  useEffect(() => { load(); }, [prId]);

  return (
    <RequireAuth>
      <div className="grid">
        <h1>Purchase Request #{pr?.prNo}</h1>
        {err && <p style={{ color: '#b00020' }}>{err}</p>}
        {!pr ? <p>Loading…</p> : (
          <>
            <p><b>Status:</b> {pr.status}</p>
            <p><b>Requested By:</b> {pr.requestedBy?.name || '—'}</p>
            <p><b>Created:</b> {new Date(pr.createdAt).toLocaleString()}</p>

            {/* Staff can Approve (auto-create PO) */}
            {user?.level === 'STAFF' && pr.status === 'CREATED' && (
              <button onClick={approve}>VALIDATE</button>
            )}

            {/* Director can Reject PR */}
            {user?.level === 'DIRECTOR' && pr.status === 'APPROVED' && (
              <button onClick={reject}>Reject</button>
            )}
          </>
        )}
      </div>
    </RequireAuth>
  );
}
