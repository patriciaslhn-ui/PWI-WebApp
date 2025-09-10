import RequireAuth from '@/components/RequireAuth';

export default function DeliveriesPage() {
  return (
    <RequireAuth>
      <h1>Deliveries</h1>
      <p>List of Deliveries will be shown here.</p>
    </RequireAuth>
  );
}

