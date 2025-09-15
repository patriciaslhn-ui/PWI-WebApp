'use client';
import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '@/lib/api';
import RequireAuth from '@/components/RequireAuth';
import {useRouter} from "next/navigation";

type Item = { id: number; sku: string; name: string; uom: string };

export default function NewPurchaseRequestPage() {
  const [deliveryDate, setDeliveryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const [lines, setLines] = useState<{ productId: number; qty: number; uom: string }[]>([]);
  const [done, setDone] = useState(false);
  const router = useRouter();

  useEffect(() => {
    apiGet<Item[]>('/api/items').then(setItems).catch(() => setItems([]));
  }, []);

  function addLine() {
    setLines([...lines, { productId: 0, qty: 1, uom: '' }]);
  }

  function removeLine(idx: number) {
    setLines(lines.filter((_, i) => i !== idx));
  }

  function handleProductChange(idx: number, productId: number) {
    const item = items.find(i => i.id === productId);
    const copy = [...lines];
    copy[idx].productId = productId;
    copy[idx].uom = item?.uom || '';   // 👈 auto fill UoM
    setLines(copy);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await apiPost('/api/purchase-requests', {
      orderingDate: new Date().toISOString(), // 👈 auto today
      deliveryDate,
      notes,
      items: lines,
    });
    setDone(true);
  }

  if (done) return <p>✅ Purchase Request submitted</p>;

  return (
    <RequireAuth>
      <div className="grid">
        <h1>New Purchase Request</h1>
        <form onSubmit={submit} className="form">
          <div>
            <label>Delivery Date</label>
            <input type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} />
          </div>
          <div>
            <label>Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} />
          </div>

          <h3>Products Requested</h3>
          {lines.map((line, idx) => (
            <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <select
                value={line.productId}
                onChange={e => handleProductChange(idx, Number(e.target.value))}
              >
                <option value={0}>— Select Product —</option>
                {items.map(i => <option key={i.id} value={i.id}>{i.sku} - {i.name}</option>)}
              </select>
              <input
                type="number"
                placeholder="Quantity"
                value={line.qty}
                onChange={e => {
                  const copy = [...lines];
                  copy[idx].qty = Number(e.target.value);
                  setLines(copy);
                }}
              />
              <input
                placeholder="Unit of Measure"
                value={line.uom}
                disabled   // 👈 readonly (auto-filled)
              />
              <button type="button" onClick={() => removeLine(idx)}>❌ Delete</button>
            </div>
          ))}
          <button type="button" onClick={addLine}>+ Add Product</button>
          <br />
          <button type="submit">Submit Request</button>
        </form>
      </div>
    </RequireAuth>
  );
}

