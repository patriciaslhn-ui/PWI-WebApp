'use client';
import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '@/lib/api';
import RequireAuth from '@/components/RequireAuth';
type Customer = { id: number; name: string };
type Warehouse = { id: number; name: string };
export default function NewSalesOrderPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [soId, setSoId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [form, setForm] = useState({
    soNo: 'SO-' + String(Math.floor(Math.random() * 900000) + 100000),
    customerId: 0,
    sku: '',
    qtyOrdered: 0,
    unitPrice: 0,
    allocWarehouseId: 0,
  });
  useEffect(() => {
    apiGet<Customer[]>('/api/customers').then(setCustomers).catch(() => setCustomers([]));
    apiGet<Warehouse[]>('/api/warehouses').then(setWarehouses).catch(() => setWarehouses([]));
  }, []);
  async function createSO(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr('');
    try {
      const created = await apiPost<{ id: number }>('/api/sales-orders', {
        soNo: form.soNo,
        customerId: Number(form.customerId),
        items: [{ sku: form.sku, qtyOrdered: Number(form.qtyOrdered), unitPrice: Number(form.unitPrice) }]
      });
      setSoId(created.id);
      alert(`SO created: #${created.id}. If customer has outstanding, approvals are required.`);
    } catch (e: any) {
      setErr(e?.message || 'Failed to create SO');
    } finally {
      setBusy(false);
    }
  }
  async function allocate() {
    if (!soId || !form.allocWarehouseId) { alert('Missing SO or warehouse.'); return; }
    setBusy(true); setErr('');
    try {
      await apiPost(`/api/sales-orders/${soId}/allocate`, { warehouseId: Number(form.allocWarehouseId) });
      alert('Allocated from FIFO batches.');
      window.open(`/sales/${soId}`, '_blank');
    } catch (e: any) {
      setErr(e?.message || 'Allocation failed');
    } finally {
      setBusy(false);
    }
  }
  return (
    <RequireAuth>
      <div className="grid">
        <h1>New Sales Order</h1>
        <form className="form" onSubmit={createSO}>
          <div><label>SO No</label><input required value={form.soNo} onChange={e => setForm({ ...form, soNo: e.target.value })} /></div>
          <div>
            <label>Customer</label>
            <select value={form.customerId} onChange={e => setForm({ ...form, customerId: Number(e.target.value) })}>
              <option value={0}>— Select —</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div><label>SKU</label><input required value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} placeholder="FG-PRF-001" /></div>
          <div><label>Qty Ordered</label><input type="number" step="0.001" value={form.qtyOrdered} onChange={e => setForm({ ...form, qtyOrdered: Number(e.target.value) })} /></div>
          <div><label>Unit Price</label><input type="number" step="0.01" value={form.unitPrice} onChange={e => setForm({ ...form, unitPrice: Number(e.target.value) })} /></div>
          <button type="submit" disabled={busy}>Create SO</button>
        </form>
        <div className="card">
          <h3>Allocate FIFO</h3>
          <p>Choose a warehouse to allocate after creating the SO.</p>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select value={form.allocWarehouseId} onChange={e => setForm({ ...form, allocWarehouseId: Number(e.target.value) })}>
              <option value={0}>— Select warehouse —</option>
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
            <button onClick={allocate} disabled={!soId || !form.allocWarehouseId || busy}>Allocate</button>
          </div>
          {soId && <p style={{ marginTop: 8 }}>SO ID: <a href={`/sales/${soId}`} target="_blank">{soId}</a></p>}
        </div>
        {err && <div style={{ color: '#b00020', marginTop: 12 }}>{err}</div>}
      </div>
    </RequireAuth>
  );
}


