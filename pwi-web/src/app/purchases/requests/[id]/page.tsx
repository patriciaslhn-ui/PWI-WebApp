'use client';
import { use } from 'react';
import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '@/lib/api';
import RequireAuth from '@/components/RequireAuth';
import { useAuth } from '@/lib/auth-context';

type Item = { id: number; sku: string; name: string };
type PRItem = { id: number; qty: string; uom: string; product: Item };
type PR = {
  id: number;
  prNo: string;
  status: string;
  orderingDate: string;
  deliveryDate: string;
  notes?: string;
  items: PRItem[];
};

export default function PurchaseRequestDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const prId = Number(id);
  const { user } = useAuth();
  const [pr, setPR] = useState<PR | null>(null);

  async function load() {
    const data = await apiGet<PR>(`/api/purchase-requests/${prId}`);
    setPR(data);
  }

  async function approve() {
    await apiPost(`/api/purchase-requests/${prId}/approve`, {});
    await load();
  }

  useEffect(() => { load(); }, [prId]);

  return (
    <RequireAuth>
      <div className="grid">
        <h1>Purchase Request #{pr?.prNo}</h1>
        {pr && (
  <>
    <p><b>Status:</b> {pr.status}</p>
    <p><b>Ordering Date:</b> {new Date(pr.orderingDate).toLocaleDateString()}</p>
    <p><b>Delivery Date:</b> {new Date(pr.deliveryDate).toLocaleDateString()}</p>
    <p><b>Requested By:</b> {pr.requestedBy?.name}</p>
    {pr.notes && <p><b>Notes:</b> {pr.notes}</p>}

    <h3>Products Requested</h3>
    <table className="table">
      <thead>
        <tr>
          <th>SKU</th>
          <th>Name</th>
          <th>Qty</th>
          <th>UoM</th>
        </tr>
      </thead>
      <tbody>
        {pr.items?.map(it => (
          <tr key={it.id}>
            <td>{it.product.sku}</td>
            <td>{it.product.name}</td>
            <td>{it.qty}</td>
            <td>{it.uom}</td>
          </tr>
        ))}
      </tbody>
    </table>

    {/* Validate button only for PURCHASING division */}
    {user?.divisions?.includes('PURCHASING') && pr.status === 'CREATED' && (
      <button onClick={approve}>Validate</button>
    )}
  </>
)}

      </div>
    </RequireAuth>
  );
}

