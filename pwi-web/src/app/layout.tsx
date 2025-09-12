import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <AuthProvider>
          <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <Topbar />
            <div style={{ display: 'flex', flex: 1 }}>
              <Sidebar />
              <main style={{ flex: 1, overflow: 'auto', padding: 16 }}>
                {children}
              </main>
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
