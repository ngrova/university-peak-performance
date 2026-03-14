import React from 'react';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata = {
  title: 'Thriving | University of Peak Performance',
  description: 'Goal and task management organized around your life pillars.',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps): React.JSX.Element {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-upp-surface text-gray-900 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
