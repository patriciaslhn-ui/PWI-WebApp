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
        { label: 'Suppliers', href: '/suppliers' },
        { label: 'Products', href: '/items' },
        { label: 'Product Variants', href: '/items/variants' },
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
    {
      label: 'Returns',
      children: [{ label: 'Return Orders', href: '/sales/returns' }],
    },
    {
      label: 'Consignment',
      children: [
        { label: 'Consignments', href: '/sales/consignments' },
        { label: 'Create Consignment Invoice', href: '/sales/consignments/invoice' },
        { label: 'Return Consignment', href: '/sales/consignments/return' },
      ],
    },
    {
      label: 'Invoicing',
      children: [{ label: 'Orders to Invoice', href: '/sales/invoicing' }],
    },
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
  expenses: [
    {
      label: 'My Expenses',
      children: [
        { label: 'Expenses to Submit', href: '/expenses/submit' },
        { label: 'Refused Reports', href: '/expenses/refused' },
        { label: 'Expenses Report', href: '/expenses/report' },
      ],
    },
    {
      label: 'Reporting',
      children: [
        { label: 'Expenses Analysis', href: '/expenses/analysis' },
        { label: 'Expenses Report Analysis', href: '/expenses/report-analysis' },
      ],
    },
    {
      label: 'To Approve',
      children: [{ label: 'Expenses to Approve', href: '/expenses/approve' }],
    },
  ],
  deliveries: [
    {
      label: 'Deliveries',
      children: [{ label: 'Delivery Orders', href: '/deliveries/orders' }],
    },
    {
      label: 'Reporting',
      children: [{ label: 'Deliveries Report', href: '/deliveries/report' }],
    },
    {
      label: 'Master Data',
      children: [
        { label: 'Products', href: '/items' },
        { label: 'Customers', href: '/customers' },
        { label: 'Logistics', href: '/deliveries/logistics' },
        { label: 'Stock', href: '/deliveries/stock' },
      ],
    },
  ],
  manufacturing: [
    {
      label: 'Operations',
      children: [{ label: 'Operations', href: '/manufacturing' }],
    },
    {
      label: 'Master Data',
      children: [{ label: 'Master Data', href: '/manufacturing/master' }],
    },
    {
      label: 'Reporting',
      children: [{ label: 'Reporting', href: '/manufacturing/report' }],
    },
  ],
  approvals: [],
  settings: [
    {
      label: 'Settings',
      children: [
        { label: 'Accounts', href: '/settings/accounts' },
        { label: 'Management', href: '/settings/management' },
        { label: 'Preferences', href: '/settings/preferences' },
      ],
    },
  ],
};

export default function Topbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const segment = pathname.split('/')[1] || '';
  const groups = sectionConfig[segment] || [];
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
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
            >
              {c.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
