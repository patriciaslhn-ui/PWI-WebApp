'use client';
import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '@/lib/api';
import RequireAuth from '@/components/RequireAuth';
import { useAuth } from '@/lib/auth-context';

type Supplier = { id: number; name: string };
type Item = { id: number; sku: string; name: string };
type POItem = { id: number; qty: string; price: string; item: Item };
type PO = {
  id: number;
  poNo: string;
  status: 'CREATED' | 'WAITING_FOR_APPROVAL' | 'APPROVED' | 'REJECTED' | 'CLOSED';
  supplier: Supplier;
  createdAt: string;
  items: POItem[];
};

export default function PurchaseOrderDetail({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const [po, setPO] = useState<PO | null>(null);
  const [err, setErr] = useState('');
  const id = Number(params.id);

  async function load() {
    try {
      const data = await apiGet<PO>(`/api/purchase-orders/${id}`);
      setPO(data);
    } catch (e: any) {
      setErr(e?.message || 'Failed to load PO');
    }
  }

  async function validate() {
    try {
      await apiPost(`/api/purchase-orders/${id}/validate`, {});
      await load();
    } catch (e: any) {
      alert(e?.message || 'Validate failed');
    }
  }

  async function approve() {
    try {
      await apiPost(`/api/purchase-orders/${id}/approve`, {});
      await load();
    } catch (e: any) {
      alert(e?.message || 'Approval failed');
    }
  }

  async function reject() {
    try {
      await apiPost(`/api/purchase-orders/${id}/reject`, {});
      await load();
    } catch (e: any) {
      alert(e?.message || 'Reject failed');
    }
  }

  useEffect(() => { load(); }, [id]);

  return (
    <RequireAuth>
      <div className="grid">
        <h1>Purchase Order #{po?.poNo}</h1>
        {err && <p style={{ color: '#b00020' }}>{err}</p>}
        {!po ? (
          <p>Loading…</p>
        ) : (
          <div>
            <p><b>Status:</b> {po.status}</p>
            <p><b>Supplier:</b> {po.supplier?.name}</p>
            <p><b>Created:</b> {new Date(po.createdAt).toLocaleString()}</p>

            <h3>Items</h3>
            <table className="table">
              <thead>
                <tr><th>SKU</th><th>Name</th><th>Qty</th><th>Price</th></tr>
              </thead>
              <tbody>
                {po.items?.map(it => (
                  <tr key={it.id}>
                    <td>{it.item?.sku}</td>
                    <td>{it.item?.name}</td>
                    <td>{it.qty}</td>
                    <td>{it.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Staff can Validate when CREATED */}
            {user?.level === 'STAFF' && po.status === 'CREATED' && (
              <button style={{ marginTop: 16 }} onClick={validate}>Validate</button>
            )}

            {/* Director can Approve/Reject when WAITING_FOR_APPROVAL */}
            {user?.level === 'DIRECTOR' && po.status === 'WAITING_FOR_APPROVAL' && (
              <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                <button onClick={approve}>Approve</button>
                <button onClick={reject}>Reject</button>
              </div>
            )}
          </div>
        )}
      </div>
    </RequireAuth>
  );
}
