'use client';
import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';
import RequireAuth from '@/components/RequireAuth';
import {useRouter} from "next/navigation";

type PurchaseOrder = {
  id: number;
  poNo: string;
  status: string;
  orderingDate: string;
  deliveryDate: string;
};

export default function PurchaseOrdersPage() {
  const [data, setData] = useState<PurchaseOrder[]>([]);
  const [error, setError] = useState('');
  const router = useRouter();

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
