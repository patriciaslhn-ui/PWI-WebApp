import RequireAuth from '@/components/RequireAuth';

export default function DashboardPage() {
  return (
    <RequireAuth>
      <h1>Dashboard</h1>
      <p>Welcome to Prioritas Wellness Indonesia Webapp.</p>
    </RequireAuth>
  );
}

