'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const menu = [
    { label: 'Sales', href: '/sales' },
    { label: 'Purchases', href: '/purchases' },
    { label: 'Expenses', href: '/expenses' },
    { label: 'Invoices', href: '/invoices' },
    { label: 'Manufacturing', href: '/manufacturing' },
    { label: 'Approval Matrix', href: '/approvals' },
    { label: 'Deliveries', href: '/deliveries' },
    { label: 'Items', href: '/items' },
    { label: 'Customers', href: '/customers' },
    { label: 'Employees', href: '/employees' },
    { label: 'Settings', href: '/settings' },
  ];

  return (
    <aside
      style={{
        width: 220,
        background: '#fafafa',
        borderRight: '1px solid #ddd',
        padding: '24px 16px',
        minHeight: '100vh',
      }}
    >
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {menu.map((m) => (
          <li key={m.href} style={{ marginBottom: 20 }}>
            <Link
              href={m.href}
              style={{
                textDecoration: 'none',
                fontSize: '18px', // bigger font
                color: pathname.startsWith(m.href) ? '#1976d2' : '#000', // active blue, otherwise black
                fontWeight: pathname.startsWith(m.href) ? 'bold' : 'normal',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
            >
              {m.label}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}