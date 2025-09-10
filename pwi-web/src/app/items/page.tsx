import RequireAuth from '@/components/RequireAuth';

export default function ItemsPage() {
  return (
    <RequireAuth>
      <h1>Items</h1>
      <p>List of Items will be shown here.</p>
    </RequireAuth>
  );
}
