import { redirect } from 'next/navigation';

/** Root page redirects to the Today tab */
export default function RootPage(): never {
  redirect('/today');
}
