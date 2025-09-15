'use client';
import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';
import RequireAuth from '@/components/RequireAuth';
import {useRouter} from "next/navigation";

type PurchaseRequest = {
  id: number;
  prNo: string;
  status: string;
  orderingDate: string;
  deliveryDate: string;
};

export default function PurchaseRequestsPage() {
  const [data, setData] = useState<PurchaseRequest[]>([]);
  const [error, setError] = useState('');
    const router = useRouter();

  useEffect(() => {
    apiGet<PurchaseRequest[]>('/api/purchase-requests')
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <RequireAuth>
      <div style={{ padding: 20 }}>
        <h1>Purchase Requests</h1>
        <button type="button" style={{padding:'10px'}}onClick={() => router.back()}>Back</button>
        <br></br>

        {error && <p style={{ color: 'red' }}>{error}</p>}
        <table className='table' style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{textAlign:'left', padding: '8px'}}>ID</th>
              <th style={{textAlign:'left', padding: '8px'}}>PR No</th>
              <th style={{textAlign:'left', padding: '8px'}}>Ordering Date</th>
              <th style={{textAlign:'left', padding: '8px'}}>Delivery Date</th>
              <th style={{textAlign:'left', padding: '8px'}}>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((pr) => (
              <tr key={pr.id}>
                <td style={{textAlign:'left', padding: '8px'}}>{pr.id}</td>
                <td style={{textAlign:'left', padding: '8px'}}>{pr.prNo}</td>
                <td style={{textAlign:'left', padding: '8px'}}>{new Date(pr.orderingDate).toLocaleDateString()}</td>
                <td style={{textAlign:'left', padding: '8px'}}>{new Date(pr.deliveryDate).toLocaleDateString()}</td>
                <td style={{textAlign:'left', padding: '8px'}}>{pr.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </RequireAuth>
  );
}
