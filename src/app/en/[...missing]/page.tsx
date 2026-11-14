import { notFound } from 'next/navigation';

// Any address that matches no page lands here and gets the English 404,
// inside this language's layout (header, footer, tab bar), with a 404 status.
export default function Missing() {
  notFound();
}
