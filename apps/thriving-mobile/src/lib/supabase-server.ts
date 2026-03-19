import { cookies } from 'next/headers';
import { createServerClient } from '@upp/db';

/** Creates a Supabase server client using the proven @upp/db pattern */
export async function getServerClient() {
  const cookieStore = await cookies();
  return createServerClient({
    get: (name: string) => cookieStore.get(name)?.value,
    set: () => {},
    remove: () => {},
  });
}
