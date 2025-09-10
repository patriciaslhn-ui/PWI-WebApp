'use client';
import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '@/lib/api';

type Item = { id:number; sku:string; name:string; type:'FG'|'RM'|'PACKAGING'; uom?:string; unitPrice?: string|null; safetyStock?: string|null };

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [form, setForm] = useState({ sku:'', name:'', type:'FG' as Item['type'], uom:'', unitPrice: '', safetyStock: '' });

  async function load() {
    const data = await apiGet<Item[]>('/api/items');
    setItems(data);
  }
  useEffect(() => { load(); }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await apiPost('/api/items', {
      ...form,
      unitPrice: form.unitPrice ? Number(form.unitPrice) : undefined,
      safetyStock: form.safetyStock ? Number(form.safetyStock) : undefined,
    });
    setForm({ sku:'', name:'', type:'FG', uom:'', unitPrice:'', safetyStock:'' });
    load();
  }

  return (
    <div className="grid">
      <h1>Items</h1>

      <form className="form" onSubmit={onSubmit}>
        <div><label>SKU</label><input required value={form.sku} onChange={e=>setForm({ ...form, sku:e.target.value })} /></div>
        <div><label>Name</label><input required value={form.name} onChange={e=>setForm({ ...form, name:e.target.value })} /></div>
        <div>
          <label>Type</label>
          <select value={form.type} onChange={e=>setForm({ ...form, type: e.target.value as Item['type'] })}>
            <option value="FG">Finished Goods</option>
            <option value="RM">Raw Material</option>
            <option value="PACKAGING">Packaging</option>
          </select>
        </div>
        <div><label>UoM</label><input value={form.uom} onChange={e=>setForm({ ...form, uom:e.target.value })} /></div>
        <div><label>Unit Price</label><input type="number" step="0.01" value={form.unitPrice} onChange={e=>setForm({ ...form, unitPrice:e.target.value })} /></div>
        <div><label>Safety Stock</label><input type="number" step="0.001" value={form.safetyStock} onChange={e=>setForm({ ...form, safetyStock:e.target.value })} /></div>
        <button type="submit">Add Item</button>
      </form>

      <h3>Item List</h3>
      <table className="table">
        <thead><tr><th>ID</th><th>SKU</th><th>Name</th><th>Type</th><th>UoM</th><th>Unit Price</th></tr></thead>
        <tbody>
          {items.map(i => (
            <tr key={i.id}>
              <td>{i.id}</td><td>{i.sku}</td><td>{i.name}</td><td>{i.type}</td><td>{i.uom || '-'}</td><td>{i.unitPrice ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
