import RequireAuth from '@/components/RequireAuth';

export default function SalesPage() {
  return (
    <RequireAuth>
      <h1>Sales Orders</h1>
      <p>List of Sales Orders will be shown here.</p>
    </RequireAuth>
  );
}

