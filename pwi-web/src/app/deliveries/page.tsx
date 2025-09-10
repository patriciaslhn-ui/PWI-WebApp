'use client';
import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';

type Shipment = {
  id:number; sjNo?:string|null; shippedAt:string; warehouseId?:number|null;
  salesOrder:{ soNo:string };
  items:{ id:number; stockId:number; qty:string }[];
};

export default function DeliveriesPage() {
  const [list, setList] = useState<Shipment[]>([]);
  async function load() {
    const data = await apiGet<Shipment[]>('/api/shipments');
    setList(data);
  }
  useEffect(() => { load(); }, []);

  return (
    <div className="grid">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <h1>Deliveries (Shipments)</h1>
        <button onClick={load}>Refresh</button>
      </div>

      <table className="table">
        <thead>
          <tr><th>ID</th><th>SJ No</th><th>SO No</th><th>Shipped At</th><th>Lines</th></tr>
        </thead>
        <tbody>
          {list.map(s => (
            <tr key={s.id}>
              <td>{s.id}</td>
              <td>{s.sjNo || '-'}</td>
              <td>{s.salesOrder?.soNo}</td>
              <td>{new Date(s.shippedAt).toLocaleString()}</td>
              <td>{s.items?.length || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
