import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FreshAI Dubai',
  description: 'FreshCousine Direct Market Fulfillment PWA',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
