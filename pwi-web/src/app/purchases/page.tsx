'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiGet } from '@/lib/api';
import RequireAuth from '@/components/RequireAuth';

type PurchaseOrder = {
  id: number;
  poNo: string;
  status: string;
  supplier: { id: number; name: string };
};

type PurchaseRequest = {
  id: number;
  prNo: string;
  status: string;
  requestedBy: { id: number; name: string };
};

export default function PurchasesPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'PO' | 'PR'>('PO');
  const [poList, setPOList] = useState<PurchaseOrder[]>([]);
  const [prList, setPRList] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  async function load() {
    setLoading(true);
    setErr('');
    try {
      const [po, pr] = await Promise.all([
        apiGet<PurchaseOrder[]>('/api/purchase-orders'),
        apiGet<PurchaseRequest[]>('/api/purchase-requests'),
      ]);
      setPOList(po);
      setPRList(pr);
    } catch (e: any) {
      setErr(e?.message || 'Failed to load purchases');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function handleNew() {
    if (tab === 'PO') {
      router.push('/purchases/new');              // redirect to PO form
    } else {
      router.push('/purchases/requests/new');     // redirect to PR form
    }
  }

  return (
    <RequireAuth>
      <div className="grid">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h1>Purchases</h1>
          <button onClick={handleNew}>+ New</button>
        </div>

        <div style={{ display:'flex', gap:8, marginBottom:16 }}>
          <button onClick={() => setTab('PO')} disabled={tab==='PO'}>Purchase Orders</button>
          <button onClick={() => setTab('PR')} disabled={tab==='PR'}>Purchase Requests</button>
        </div>

        {loading && <p>Loading…</p>}
        {err && <p style={{ color:'#b00020' }}>{err}</p>}

        {tab === 'PO' && (
          <table className="table">
            <thead>
              <tr><th>ID</th><th>PO No</th><th>Supplier</th><th>Status</th><th>Open</th></tr>
            </thead>
            <tbody>
              {poList.map(po => (
                <tr key={po.id}>
                  <td>{po.id}</td>
                  <td>{po.poNo}</td>
                  <td>{po.supplier?.name}</td>
                  <td>{po.status}</td>
                  <td><a href={`/purchases/${po.id}`}><button>Open</button></a></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 'PR' && (
          <table className="table">
            <thead>
              <tr><th>ID</th><th>PR No</th><th>Requested By</th><th>Status</th><th>Open</th></tr>
            </thead>
            <tbody>
              {prList.map(pr => (
                <tr key={pr.id}>
                  <td>{pr.id}</td>
                  <td>{pr.prNo}</td>
                  <td>{pr.requestedBy?.name}</td>
                  <td>{pr.status}</td>
                  <td><a href={`/purchases/requests/${pr.id}`}><button>Open</button></a></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </RequireAuth>
  );
}
