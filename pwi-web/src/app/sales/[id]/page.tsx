'use client';
import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';


type Alloc = { qty: string; stock: { batchNo?: string | null } };
type Item = {
  id: number;
  qtyOrdered: string;
  qtyFulfilled: string;
  unitPrice: string;
  item: { sku: string; name: string };
  allocations: Alloc[];
};
type SO = {
  id: number;
  soNo: string;
  status: 'CREATED' | 'PENDING' | 'PARTIALLY_SHIPPED' | 'FULLY_SHIPPED' | 'CANCELLED';
  approvalStatus: 'AUTO_APPROVED' | 'WAITING_MANAGER' | 'WAITING_DIRECTOR' | 'APPROVED' | 'REJECTED';
  customer: { name: string };
  items: Item[];
};


export default function SOViewPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const { user } = useAuth();
  const [so, setSO] = useState<SO | null>(null);
  const [error, setError] = useState('');


  useEffect(() => {
    if (!user) {
      if (typeof window !== 'undefined') window.location.href = '/login';
      return;
    }
    (async () => {
      try {
        const data = await apiGet<SO>(`/api/sales-orders/${id}`);
        setSO(data);
      } catch (err: any) {
        setError(err?.message || 'Failed to load');
      }
    })();
  }, [id, user]);


  if (!user) return null;
  if (!so) return <div>Loading… {error && <span style={{ color: 'red' }}>{error}</span>}</div>;


  async function approve(level: 'manager' | 'director') {
    try {
      await apiPost(`/api/sales-orders/${id}/approve`, { level });
      const re = await apiGet<SO>(`/api/sales-orders/${id}`);
      setSO(re);
    } catch (err: any) {
      alert(err?.message || 'Approval failed');
    }
  }


  async function shipAllocated() {
    try {
      await apiPost(`/api/sales-orders/${id}/ship`, { shipAllAllocated: true });
      alert('Shipment created from allocated batches.');
      const re = await apiGet<SO>(`/api/sales-orders/${id}`);
      setSO(re);
      window.open('/deliveries', '_blank');
    } catch (err: any) {
      alert(err?.message || 'Shipment failed');
    }
  }


  return (
    <div className="grid">
      <h1>Sales Order #{so.soNo}</h1>
      <p><b>Customer:</b> {so.customer?.name} • <b>Status:</b> {so.status} • <b>Approval:</b> {so.approvalStatus}</p>


      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        {/* Manager approval → only MANAGER or DIRECTOR */}
        {so.approvalStatus === 'WAITING_MANAGER' && (user.level === 'MANAGER' || user.level === 'DIRECTOR') && (
          <button onClick={() => approve('manager')}>Approve (Manager)</button>
        )}
        {/* Director approval → only DIRECTOR */}
        {so.approvalStatus === 'WAITING_DIRECTOR' && user.level === 'DIRECTOR' && (
          <button onClick={() => approve('director')}>Approve (Director)</button>
        )}
        {/* Ship allocated → SUPERVISOR or higher & only when approved */}
        {(so.approvalStatus === 'APPROVED' || so.approvalStatus === 'AUTO_APPROVED') &&
          (user.level === 'SUPERVISOR' || user.level === 'MANAGER' || user.level === 'DIRECTOR') && (
            <button onClick={shipAllocated}>Ship allocated</button>
        )}
      </div>


      <h3 style={{ marginTop: 16 }}>Items</h3>
      <table className="table">
        <thead><tr><th>SKU</th><th>Name</th><th>Ordered</th><th>Fulfilled</th><th>Unit Price</th><th>Allocations (Batch → Qty)</th></tr></thead>
        <tbody>
          {so.items.map(it => (
            <tr key={it.id}>
              <td>{it.item?.sku}</td>
              <td>{it.item?.name}</td>
              <td>{it.qtyOrdered}</td>
              <td>{it.qtyFulfilled}</td>
              <td>{it.unitPrice}</td>
              <td>
                {it.allocations?.length
                  ? it.allocations.map((a, idx) => (<div key={idx}>{a.stock?.batchNo || '(no batch)'} → {a.qty}</div>))
                  : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

