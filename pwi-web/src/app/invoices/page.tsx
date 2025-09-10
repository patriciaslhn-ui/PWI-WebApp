import RequireAuth from '@/components/RequireAuth';

export default function InvoicesPage() {
  return (
    <RequireAuth>
      <h1>Invoices</h1>
      <p>List of Invoices will be shown here.</p>
    </RequireAuth>
  );
}

