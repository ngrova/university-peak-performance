import React from 'react';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@upp/db';

interface AppLayoutProps {
  children: React.ReactNode;
}

// Server Component — validates auth session before rendering any /(app)/* page
export default async function AppLayout({ children }: AppLayoutProps): Promise<React.JSX.Element> {
  const cookieStore = await cookies();

  const supabase = createServerClient({
    get: (name) => cookieStore.get(name)?.value,
    set: () => {},
    remove: () => {},
  });

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return <>{children}</>;
}
