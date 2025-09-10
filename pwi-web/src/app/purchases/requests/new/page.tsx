'use client';
import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '@/lib/api';
import RequireAuth from '@/components/RequireAuth';

type Item = { id: number; sku: string; name: string };

export default function NewPurchaseRequestPage() {
  const [orderingDate, setOrderingDate] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const [lines, setLines] = useState<{ productId: number; qty: number; uom: string }[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    apiGet<Item[]>('/api/items').then(setItems).catch(() => setItems([]));
  }, []);

  function addLine() {
    setLines([...lines, { productId: 0, qty: 1, uom: '' }]);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await apiPost('/api/purchase-requests', {
      orderingDate,
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
            <label>Ordering Date </label>
            <input type="date" value={orderingDate} onChange={e => setOrderingDate(e.target.value)} />
          </div>
          <div>
            <label>Delivery Date </label>
            <input type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} />
          </div>

          <h3>Products Requested</h3>
          {lines.map((line, idx) => (
            <div key={idx} style={{ display: 'flex', gap: 8 }}>
              <select
                value={line.productId}
                onChange={e => {
                  const copy = [...lines];
                  copy[idx].productId = Number(e.target.value);
                  setLines(copy);
                }}
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
                onChange={e => {
                  const copy = [...lines];
                  copy[idx].uom = e.target.value;
                  setLines(copy);
                }}
              />
            </div>
          ))}
          <button type="button" onClick={addLine}>+ Add Product</button>
          <br />
          <div>
            <label>Notes</label><br></br>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
          <br></br>
          <button type="submit">Submit Request</button>
        </form>
      </div>
    </RequireAuth>
  );
}
