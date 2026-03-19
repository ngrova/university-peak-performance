import { redirect } from 'next/navigation';

/** Capture is a bottom sheet, not a page — redirect to Today */
export default function CapturePage(): never {
  redirect('/today');
}
