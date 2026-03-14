import type { Metadata } from 'next';
import { Press_Start_2P } from 'next/font/google';
import './globals.css';

const pressStart2P = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-press-start-2p',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Albus's Lookout",
  description: 'Token Command Dashboard — Nick Grover HQ',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`min-h-screen bg-[#1a1520] text-[#E5E5E5] antialiased ${pressStart2P.variable}`}>
        {children}
      </body>
    </html>
  );
}
