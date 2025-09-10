'use client';
import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';
import RequireAuth from '@/components/RequireAuth';


type SO = {
  id: number;
  soNo: string;
  status: 'CREATED' | 'PENDING' | 'PARTIALLY_SHIPPED' | 'FULLY_SHIPPED' | 'CANCELLED';
  approvalStatus: 'AUTO_APPROVED' | 'WAITING_MANAGER' | 'WAITING_DIRECTOR' | 'APPROVED' | 'REJECTED';
  customer: { id: number; name: string };
  items: { id: number }[];
};


export default function SalesListPage() {
  const [list, setList] = useState<SO[]>([]);
  const [filter, setFilter] = useState({ approvalStatus: '', status: '' });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');


  useEffect(() => {
    (async () => {
      setLoading(true); setErr('');
      try {
        const qs = new URLSearchParams();
        if (filter.approvalStatus) qs.set('approvalStatus', filter.approvalStatus);
        if (filter.status) qs.set('status', filter.status);
        const data = await apiGet<SO[]>(`/api/sales-orders${qs.size ? `?${qs.toString()}` : ''}`);
        setList(data);
      } catch (e: any) {
        setErr(e?.message || 'Failed to load Sales Orders');
      } finally {
        setLoading(false);
      }
    })();
  }, [filter.approvalStatus, filter.status]);


  return (
    <RequireAuth>
      <div className="grid">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Sales Orders</h1>
          <a href="/sales/new"><button>+ New SO</button></a>
        </div>


        <div className="card" style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <label>Approval</label><br />
            <select value={filter.approvalStatus} onChange={e => setFilter({ ...filter, approvalStatus: e.target.value })}>
              <option value="">All</option>
              <option value="AUTO_APPROVED">Auto approved</option>
              <option value="WAITING_MANAGER">Waiting Manager</option>
              <option value="WAITING_DIRECTOR">Waiting Director</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
          <div>
            <label>Status</label><br />
            <select value={filter.status} onChange={e => setFilter({ ...filter, status: e.target.value })}>
              <option value="">All</option>
              <option value="CREATED">Created</option>
              <option value="PENDING">Pending</option>
              <option value="PARTIALLY_SHIPPED">Partially Shipped</option>
              <option value="FULLY_SHIPPED">Fully Shipped</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <button onClick={() => setFilter({ approvalStatus: '', status: '' })}>Clear</button>
        </div>


        {loading && <p>Loading…</p>}
        {err && <p style={{ color: '#b00020' }}>{err}</p>}


        <table className="table">
          <thead>
            <tr><th>ID</th><th>SO No</th><th>Customer</th><th>Items</th><th>Approval</th><th>Status</th><th>Open</th></tr>
          </thead>
          <tbody>
            {list.map(so => (
              <tr key={so.id}>
                <td>{so.id}</td>
                <td>{so.soNo}</td>
                <td>{so.customer?.name}</td>
                <td>{so.items?.length || 0}</td>
                <td>
                  <span style={{
                    padding: '2px 8px', borderRadius: 999,
                    background: so.approvalStatus === 'APPROVED' || so.approvalStatus === 'AUTO_APPROVED' ? '#e8f5e9' : '#fff3e0',
                    color: so.approvalStatus === 'APPROVED' || so.approvalStatus === 'AUTO_APPROVED' ? '#2e7d32' : '#ef6c00',
                    fontWeight: 600
                  }}>
                    {so.approvalStatus}
                  </span>
                </td>
                <td>{so.status}</td>
                <td><a href={`/sales/${so.id}`}><button>Open</button></a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </RequireAuth>
  );
}

