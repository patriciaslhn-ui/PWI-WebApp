import RequireAuth from '@/components/RequireAuth';

export default function ApprovalsPage() {
  return (
    <RequireAuth>
      <h1>Approval Matrix</h1>
      <p>Pending approvals will be shown here based on user role.</p>
    </RequireAuth>
  );
}

