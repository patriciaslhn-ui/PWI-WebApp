// src/app/page.tsx
export default function Dashboard() {
  return (
    <div className="grid">
      <h1>Dashboard</h1>
      <p>Welcome to Prioritas Wellness Indonesia internal app.</p>
      <ul>
        <li>Use <b>Items</b> to add FG/RM SKUs.</li>
        <li>Use <b>Warehouses</b> to add Raw Material and Finished Goods warehouses.</li>
        <li>Use <b>Stock Receive</b> to add batches by <b>SKU</b>.</li>
        <li>Use <b>New Sales Order</b> to create an SO (by <b>SKU</b>) and allocate FIFO.</li>
      </ul>
    </div>
  );
}
