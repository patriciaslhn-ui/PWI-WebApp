import RequireAuth from '@/components/RequireAuth';

export default function ExpensesPage() {
  return (
    <RequireAuth>
      <h1>Expenses</h1>
      <p>List of Expenses will be shown here.</p>
    </RequireAuth>
  );
}
