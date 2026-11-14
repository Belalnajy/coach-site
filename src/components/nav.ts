/** Is `pathname` this page or inside it? Home only matches itself. */
export const isActive = (pathname: string, target: string): boolean =>
  target === '/' || target === '/en' ? pathname === target : pathname === target || pathname.startsWith(`${target}/`);
