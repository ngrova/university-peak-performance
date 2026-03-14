import React from 'react';

interface AppLayoutProps {
  children: React.ReactNode;
}

// Authenticated layout — will add sidebar/header in a future PR
export default function AppLayout({ children }: AppLayoutProps): React.JSX.Element {
  return <>{children}</>;
}
