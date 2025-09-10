'use client';
import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '@/lib/api';
import RequireAuth from '@/components/RequireAuth';

type Supplier = { id: number; name: string };
type Item = { id: number; sku: string; name: string };

export default function NewPurchaseOrderPage() {
  const [poNo, setPoNo] = useState(`PO-${Date.now()}`);
  const [supplierId, setSupplierId] = useState(0);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [lineItems, setLineItems] = useState<{ itemId: number; qty: number; price: number }[]>([]);
  const [err, setErr] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    apiGet<Supplier[]>('/api/suppliers').then(setSuppliers).catch(() => setSuppliers([]));
    apiGet<Item[]>('/api/items').then(setItems).catch(() => setItems([]));
  }, []);

  function addLine() {
    setLineItems([...lineItems, { itemId: 0, qty: 1, price: 0 }]);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    try {
      await apiPost('/api/purchase-orders', {
        poNo,
        supplierId,
        items: lineItems,
      });
      setDone(true);
    } catch (e: any) {
      setErr(e?.message || 'Failed to create PO');
    }
  }

  if (done) return <p>✅ Purchase Order created!</p>;

  return (
    <RequireAuth>
      <div className="grid">
        <h1>New Purchase Order</h1>
        <form onSubmit={submit} className="form">
          <div>
            <label>PO No</label>
            <input value={poNo} onChange={e => setPoNo(e.target.value)} />
          </div>
          <div>
            <label>Supplier</label>
            <select value={supplierId} onChange={e => setSupplierId(Number(e.target.value))}>
              <option value={0}>— Select Supplier —</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <h3>Items</h3>
          {lineItems.map((li, idx) => (
            <div key={idx} style={{ display:'flex', gap:8 }}>
              <select
                value={li.itemId}
                onChange={e => {
                  const copy = [...lineItems];
                  copy[idx].itemId = Number(e.target.value);
                  setLineItems(copy);
                }}
              >
                <option value={0}>— Select Item —</option>
                {items.map(i => <option key={i.id} value={i.id}>{i.sku} - {i.name}</option>)}
              </select>
              <input
                type="number"
                placeholder="Qty"
                value={li.qty}
                onChange={e => {
                  const copy = [...lineItems];
                  copy[idx].qty = Number(e.target.value);
                  setLineItems(copy);
                }}
              />
              <input
                type="number"
                placeholder="Price"
                value={li.price}
                onChange={e => {
                  const copy = [...lineItems];
                  copy[idx].price = Number(e.target.value);
                  setLineItems(copy);
                }}
              />
            </div>
          ))}
          <button type="button" onClick={addLine}>+ Add Item</button>
          <br />
          <button type="submit">Create PO</button>
        </form>
        {err && <p style={{ color: '#b00020' }}>{err}</p>}
      </div>
    </RequireAuth>
  );
}
