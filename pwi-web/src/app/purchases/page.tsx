'use client';
import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';
import RequireAuth from '@/components/RequireAuth';

type PurchaseOrder = {
  id: number;
  poNo: string;
  status: 'CREATED' | 'WAITING_FOR_APPROVAL' | 'APPROVED' | 'REJECTED' | 'CLOSED';
  supplier: { id: number; name: string };
};

type PurchaseRequest = {
  id: number;
  prNo: string;
  status: 'CREATED' | 'VALIDATED' | 'APPROVED' | 'REJECTED';
  requestedBy: { id: number; name: string };
};

export default function PurchasesPage() {
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
        apiGet<PurchaseRequest[]>('/api/purchase-requests')
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

  return (
    <RequireAuth>
      <div className="grid">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h1>Purchases</h1>
          <button onClick={() => alert('TODO: implement new PO/PR form')}>+ New</button>
        </div>

        <div style={{ display:'flex', gap:8, marginBottom:16 }}>
          <button onClick={() => setTab('PO')} disabled={tab==='PO'}>Purchase Orders</button>
          <button onClick={() => setTab('PR')} disabled={tab==='PR'}>Purchase Requests</button>
        </div>

        {loading && <p>Loading…</p>}
        {err && <p style={{ color:'#b00020' }}>{err}</p>}

        {tab === 'PO' && (
          <div>
            <h2>Purchase Orders</h2>
            <br></br>
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
                  <td>
                    <span style={{
                      padding:'2px 8px', borderRadius:999,
                      background: po.status==='APPROVED' ? '#e8f5e9'
                        : po.status==='WAITING_FOR_APPROVAL' ? '#fff3e0'
                        : '#fce4ec',
                      color: po.status==='APPROVED' ? '#2e7d32'
                        : po.status==='WAITING_FOR_APPROVAL' ? '#ef6c00'
                        : '#b00020',
                      fontWeight:600
                    }}>
                      {po.status}
                    </span>
                  </td>
                  <td><a href={`/purchases/${po.id}`}><button>Open</button></a></td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}

        {tab === 'PR' && (
          <div>
            <h2>Purchase Requests</h2>
            <br></br>
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
                  <td>
                    <span style={{
                      padding:'2px 8px', borderRadius:999,
                      background: pr.status==='APPROVED' ? '#e8f5e9'
                        : pr.status==='VALIDATED' ? '#e3f2fd'
                        : pr.status==='CREATED' ? '#f5f5f5'
                        : '#fce4ec',
                      color: pr.status==='APPROVED' ? '#2e7d32'
                        : pr.status==='VALIDATED' ? '#1976d2'
                        : pr.status==='CREATED' ? '#444'
                        : '#b00020',
                      fontWeight:600
                    }}>
                      {pr.status}
                    </span>
                  </td>
                  <td><a href={`/purchases/requests/${pr.id}`}><button>Open</button></a></td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </RequireAuth>
  );
}

