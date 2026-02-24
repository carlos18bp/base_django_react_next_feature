import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/layout/Header';
import Providers from './providers';

export const metadata: Metadata = {
  title: 'Base Django + React + Next Feature Template',
  description: 'A template for building web applications with Django and React',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <Providers>
          <Header />
          {children}
          <footer className="border-t mt-16">
            <div className="max-w-6xl mx-auto px-6 py-10 text-sm text-gray-600">
              &copy; 2026 Base Django + React + Next Feature Template
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
