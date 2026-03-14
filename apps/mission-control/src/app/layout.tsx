import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mission Control',
  description: 'OpenClaw HUD — context gauge and session rewind',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0D0D0D] text-[#E5E5E5] antialiased">
        {children}
      </body>
    </html>
  );
}
