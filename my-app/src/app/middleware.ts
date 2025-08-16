import { NextResponse, NextRequest } from 'next/server';
export function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  const url = req.nextUrl;
  const isAuth =
    url.pathname.startsWith('/signin') || url.pathname.startsWith('/signup');
  const isProtected = url.pathname.startsWith('/') && !isAuth;
  if (!token && isProtected) {
    url.pathname = '/signin';
    return NextResponse.redirect(url);
  }
  if (token && isAuth) {
    url.pathname = '/';
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}
export const config = {
  matcher: [
    '/((?!_next|api|manifest.webmanifest|sw.js|icon-192.png|icon-512.png).*)',
  ],
};
