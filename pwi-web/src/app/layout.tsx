import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/Providers';
import Sidebar from '@/components/Sidebar';


export const metadata: Metadata = {
  title: 'PWI Web',
  description: 'Prioritas Wellness Indonesia Webapp',
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif' }}>
        <Providers>
          <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', minHeight: '100vh' }}>
            <Sidebar />
            <main style={{ padding: 24 }}>{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}

