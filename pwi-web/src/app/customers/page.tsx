'use client';
import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';
import RequireAuth from '@/components/RequireAuth';

type Customer = {
  id: number;
  name: string;
  phone?: string;
  address?: string;
  creditTermsDays?: number;
  outstandingBalance?: string; // Prisma returns Decimal as string
};

function rupiah(x?: string) {
  const n = Number(x ?? 0);
  return n.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
}

export default function CustomersPage() {
  
  const [list, setList] = useState<Customer[]>([]);

  async function load() {
    const data = await apiGet<Customer[]>('/api/customers');
    setList(data);
  }
  useEffect(() => { load(); }, []);

  return (
    <RequireAuth>
    <div className="grid">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <h1>Customers</h1>
        <button onClick={load}>Refresh</button>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>ID</th><th>Name</th><th>Phone</th><th>Address</th><th>Terms</th><th>Outstanding</th>
          </tr>
        </thead>
        <tbody>
          {list.map(c => {
            const ob = Number(c.outstandingBalance ?? 0);
            const color = ob > 0 ? '#b00020' : '#2e7d32';
            const bg = ob > 0 ? '#ffebee' : '#e8f5e9';
            return (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.name}</td>
                <td>{c.phone || '-'}</td>
                <td>{c.address || '-'}</td>
                <td>{typeof c.creditTermsDays === 'number' ? `Net ${c.creditTermsDays}` : '-'}</td>
                <td>
                  <span style={{ padding:'2px 8px', borderRadius: 999, background:bg, color, fontWeight:600 }}>
                    {rupiah(c.outstandingBalance)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <p style={{ color:'#666', fontSize:12, marginTop:8 }}>
        Note: If Outstanding &gt; 0, new Sales Orders will require Manager and Director approvals.
      </p>
    </div>
    </RequireAuth>
  );

}
