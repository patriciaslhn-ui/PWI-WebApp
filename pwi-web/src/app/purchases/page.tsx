'use client';
import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';
import RequireAuth from '@/components/RequireAuth';


type PurchaseOrder = {
  id: number;
  poNo: string;
  status: 'CREATED' | 'PENDING' | 'PARTIALLY_SHIPPED' | 'FULLY_SHIPPED' | 'CANCELLED';
  approvalStatus: 'AUTO_APPROVED' | 'WAITING_MANAGER' | 'WAITING_DIRECTOR' | 'APPROVED' | 'REJECTED';
  orderingDate: string;
  deliveryDate: string;
};


export default function PurchaseOrdersPage() {
  const [data, setData] = useState<PurchaseOrder[]>([]);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState({ approvalStatus: '', status: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiGet<PurchaseOrder[]>('/api/purchase-orders')
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);


  

  return (
    <RequireAuth>
      <div style={{ padding: 20 }}>

        <h1>Purchase Orders</h1>
        
        <br></br>
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

        {error && <p style={{ color: 'red' }}>{error}</p>}
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{textAlign:'left', padding: '8px'}}>ID</th>
              <th style={{textAlign:'left', padding: '8px'}}>No</th>
              <th style={{textAlign:'left', padding: '8px'}}>Ordering Date</th>
              <th style={{textAlign:'left', padding: '8px'}}>Delivery Date</th>
              <th style={{textAlign:'left', padding: '8px'}}>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((po) => (
              <tr key={po.id}>
                <td>{po.id}</td>
                <td>{po.poNo}</td>
                <td>{new Date(po.orderingDate).toLocaleDateString()}</td>
                <td>{new Date(po.deliveryDate).toLocaleDateString()}</td>
                <td>{po.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </RequireAuth>
  );
}
