'use client';
import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';
import RequireAuth from '@/components/RequireAuth';

type Item = {
  id: number;
  sku: string;
  name: string;
  type: string;
  uom: string | null;
  unitPrice: string | null;
  safetyStock: string | null;
};

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiGet<Item[]>('/api/items')
      .then(setItems)
      .catch((err) => setError(err.message || 'Failed to fetch items'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <RequireAuth>
      <div style={{ padding: 20 }}>
        <h1>Items</h1>
        <br></br>

        {loading && <p>Loading…</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {!loading && !error && (
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>SKU</th>
                <th>Name</th>
                <th>Type</th>
                <th>UoM</th>
                <th>Unit Price</th>
                <th>Safety Stock</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td>{it.id}</td>
                  <td>{it.sku}</td>
                  <td>{it.name}</td>
                  <td>{it.type}</td>
                  <td>{it.uom ?? '-'}</td>
                  <td>{it.unitPrice ?? '-'}</td>
                  <td>{it.safetyStock ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </RequireAuth>
  );
}
