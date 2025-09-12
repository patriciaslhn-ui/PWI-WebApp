'use client';
import { useAuth } from '@/lib/auth-context';

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a href={href} style={{ padding:'8px 10px', borderRadius:8, display:'block' }}>{children}</a>
);

export default function Sidebar() {
  const { user, ready, logout } = useAuth();

  return (
    <aside style={{ padding: 16, borderRight: '1px solid #eee', background: '#fafafa' }}>
      <h2 style={{ marginTop: 0 }}>PWI</h2>
      <div style={{ fontSize:12, color:'#444', marginBottom:8, minHeight:40 }}>
        {!ready ? '...' : (user
          ? <>Signed in as <b>{user.name || user.email}</b><div>Level: {user.level}</div></>
          : 'Not signed in')}
      </div>
      {user ? <button onClick={logout} style={{ marginBottom:12 }}>Logout</button> : <a href="/login"><button>Login</button></a>}

      <nav>
        <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 6 }}>
          <li><NavLink href="/">Dashboard</NavLink></li>
          <li><NavLink href="/purchases">Purchases</NavLink></li>
          <li><NavLink href="/sales">Sales</NavLink></li>
          <li><NavLink href="/manufacturing">Manufacturing</NavLink></li>
          <li><NavLink href="/deliveries">Deliveries</NavLink></li>
          <li><NavLink href="/invoices">Invoices</NavLink></li>
          <li><NavLink href="/expenses">Expenses</NavLink></li>
          <li><NavLink href="/items">Items</NavLink></li>
          <li><NavLink href="/approvals">Approval Matrix</NavLink></li>
          <li><NavLink href="/settings">Settings</NavLink></li>
        </ul>
      </nav>
    </aside>
  );
}

