'use client';
import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '@/lib/api';

type Warehouse = { id:number; name:string };

export default function WarehousesPage() {
  const [list, setList] = useState<Warehouse[]>([]);
  const [name, setName] = useState('');

  async function load() {
    const data = await apiGet<Warehouse[]>('/api/warehouses');
    setList(data);
  }
  useEffect(() => { load(); }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await apiPost('/api/warehouses', { name });
    setName('');
    load();
  }

  return (
    <div className="grid">
      <h1>Warehouses</h1>

      <form className="form" onSubmit={onSubmit}>
        <div><label>Warehouse name</label><input required value={name} onChange={e=>setName(e.target.value)} /></div>
        <button type="submit">Add Warehouse</button>
      </form>

      <h3>List</h3>
      <table className="table">
        <thead><tr><th>ID</th><th>Name</th></tr></thead>
        <tbody>
          {list.map(w => (<tr key={w.id}><td>{w.id}</td><td>{w.name}</td></tr>))}
        </tbody>
      </table>
    </div>
  );
}
