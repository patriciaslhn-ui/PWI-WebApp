'use client';
import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '@/lib/api';

type Warehouse = { id:number; name:string };

export default function StockReceivePage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [form, setForm] = useState({
    sku:'', warehouseId: 0, batchNo:'', qty: 0, unitCost: 0, receivedAt: '', expiry: ''
  });

  useEffect(() => { apiGet<Warehouse[]>('/api/warehouses').then(setWarehouses); }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await apiPost('/api/stock/receive', {
      sku: form.sku,
      warehouseId: Number(form.warehouseId),
      batchNo: form.batchNo || undefined,
      qty: Number(form.qty),
      unitCost: form.unitCost ? Number(form.unitCost) : undefined,
      receivedAt: form.receivedAt || undefined,
      expiry: form.expiry || undefined,
    });
    alert('Stock received.');
    setForm({ sku:'', warehouseId: 0, batchNo:'', qty: 0, unitCost: 0, receivedAt:'', expiry:'' });
  }

  return (
    <div className="grid">
      <h1>Stock Receive</h1>
      <form className="form" onSubmit={onSubmit}>
        <div><label>SKU</label><input required value={form.sku} onChange={e=>setForm({ ...form, sku:e.target.value })} placeholder="e.g. FG-PRF-001" /></div>
        <div>
          <label>Warehouse</label>
          <select value={form.warehouseId} onChange={e=>setForm({ ...form, warehouseId: Number(e.target.value) })}>
            <option value={0}>— Select —</option>
            {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </div>
        <div><label>Batch No</label><input value={form.batchNo} onChange={e=>setForm({ ...form, batchNo: e.target.value })} placeholder="e.g. 0010925" /></div>
        <div><label>Qty</label><input type="number" step="0.001" value={form.qty} onChange={e=>setForm({ ...form, qty:Number(e.target.value) })} /></div>
        <div><label>Unit Cost</label><input type="number" step="0.01" value={form.unitCost} onChange={e=>setForm({ ...form, unitCost:Number(e.target.value) })} /></div>
        <div><label>Received At</label><input type="datetime-local" value={form.receivedAt} onChange={e=>setForm({ ...form, receivedAt:e.target.value })} /></div>
        <div><label>Expiry</label><input type="date" value={form.expiry} onChange={e=>setForm({ ...form, expiry:e.target.value })} /></div>
        <button type="submit">Receive</button>
      </form>
    </div>
  );
}
