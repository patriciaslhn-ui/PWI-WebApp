import RequireAuth from '@/components/RequireAuth';

export default function ManufacturingPage() {
  return (
    <RequireAuth>
      <h1>Manufacture Orders</h1>
      <p>List of Manufacturing Orders and Requests will be shown here.</p>
    </RequireAuth>
  );
}

