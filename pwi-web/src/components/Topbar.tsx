'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useState } from 'react';

type NavGroup = {
  label: string;
  children: { label: string; href: string }[];
};

const sectionConfig: Record<string, NavGroup[]> = {
  purchases: [
    {
      label: 'Purchases',
      children: [
        { label: 'Purchase Requests', href: '/purchases/requests' },
        { label: 'Purchase Orders', href: '/purchases/orders' },
        { label: 'Suppliers', href: '/purchases/suppliers' },
        { label: 'Products', href: '/purchases/products' },
        { label: 'Product Variants', href: '/purchases/variants' },
      ],
    },
    {
      label: 'Reporting',
      children: [
        { label: 'Purchase Report', href: '/purchases/report' },
        { label: 'Monitoring PO', href: '/purchases/monitor' },
        { label: 'Purchase History', href: '/purchases/history' },
        { label: 'Products Received Report', href: '/purchases/received' },
        { label: 'Purchased Invoices Report', href: '/purchases/invoices' },
      ],
    },
  ],
  sales: [
    {
      label: 'Orders',
      children: [
        { label: 'Orders', href: '/sales/orders' },
        { label: 'Customers', href: '/sales/customers' },
        { label: 'Claim Sales Program', href: '/sales/claims' },
      ],
    },
    { label: 'Returns', children: [{ label: 'Return Orders', href: '/sales/returns' }] },
    {
      label: 'Consignment',
      children: [
        { label: 'Consignments', href: '/sales/consignments' },
        { label: 'Create Consignment Invoice', href: '/sales/consignments/invoice' },
        { label: 'Return Consignment', href: '/sales/consignments/return' },
      ],
    },
    { label: 'Invoicing', children: [{ label: 'Orders to Invoice', href: '/sales/invoicing' }] },
    {
      label: 'Catalog',
      children: [
        { label: 'Products', href: '/sales/products' },
        { label: 'Product Variants', href: '/sales/variants' },
        { label: 'Pricelists', href: '/sales/pricelists' },
      ],
    },
    {
      label: 'Reporting',
      children: [
        { label: 'Sales', href: '/sales/report' },
        { label: 'Sales Report', href: '/sales/report/summary' },
        { label: 'Daftar Faktur Penjualan', href: '/sales/invoices' },
        { label: 'Consignment Sales Report', href: '/sales/report/consignment-sales' },
        { label: 'Consignment Report', href: '/sales/report/consignment' },
        { label: 'Outstanding Customer Sales Report', href: '/sales/report/outstanding' },
      ],
    },
  ],
  // ... same structure for expenses, deliveries, manufacturing, settings
};

export default function Topbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const segment = pathname.split('/')[1] || '';
  const groups = sectionConfig[segment] || [];

  // Which top-level tab is open
  const [activeGroup, setActiveGroup] = useState<string | null>(groups[0]?.label || null);

  return (
    <header style={{ background: '#e5e5e5' }}>
      {/* Row 1: Logo + Tabs + User */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 20px',
        }}
      >
        <div><b>PWI LOGO</b></div>

        <nav style={{ flex: 1, marginLeft: 40 }}>
          {groups.map((g) => (
            <button
              key={g.label}
              onClick={() => setActiveGroup(g.label)}
              style={{
                marginRight: 20,
                background: 'none',
                border: 'none',
                fontSize: '15px',
                cursor: 'pointer',
                fontWeight: activeGroup === g.label ? 'bold' : 'normal',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
            >
              {g.label.toUpperCase()}
            </button>
          ))}
        </nav>

        <div>
          {user ? (
            <>
              Hello, {user.name}
              <button onClick={logout} style={{ marginLeft: 12 }}>Log out</button>
            </>
          ) : (
            <>
              <Link href="/login">SIGN IN</Link> | <Link href="/contact">CONTACT US</Link>
            </>
          )}
        </div>
      </div>

      {/* Row 2: Sub-tabs for active group */}
      {activeGroup && (
        <div style={{ padding: '8px 20px', borderTop: '1px solid #ccc', background: '#f8f8f8' }}>
          {(groups.find((g) => g.label === activeGroup)?.children || []).map((c) => (
            <Link
              key={c.href}
              href={c.href}
              style={{
                marginRight: 20,
                textDecoration: 'none',
                color: pathname === c.href ? '#1976d2' : '#000',
                fontWeight: pathname === c.href ? 'bold' : 'normal',
                
              }}
            >
              {c.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
