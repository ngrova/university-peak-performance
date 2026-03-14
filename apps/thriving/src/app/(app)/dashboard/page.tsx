import React from 'react';
import { cookies } from 'next/headers';
import { createServerClient } from '@upp/db';

// Server Component — user is already validated by AppLayout
export default async function DashboardPage(): Promise<React.JSX.Element> {
  const cookieStore = await cookies();

  const supabase = createServerClient({
    get: (name) => cookieStore.get(name)?.value,
    set: () => {},
    remove: () => {},
  });

  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-2">Welcome to Thriving</h1>
      {user?.email && (
        <p className="text-gray-600">Signed in as {user.email}</p>
      )}
    </main>
  );
}
