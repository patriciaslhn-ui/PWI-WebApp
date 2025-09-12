import RequireAuth from '@/components/RequireAuth';

export default function SettingsPage() {
  return (
    <RequireAuth>
      <h1>Settings</h1>
      <p>Account Settings in progress</p>
    </RequireAuth>
  );
}
