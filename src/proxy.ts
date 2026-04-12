import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const locales = ['en', 'ar'];
const defaultLocale = 'ar';

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 1. Bypass asset paths
  if (
    pathname.startsWith('/_next/') ||
    pathname.includes('/api/') ||
    pathname.includes('/uploads/') ||
    pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/)
  ) {
    // If it's an API route and inside /api/admin, we must authenticate
    if (pathname.startsWith('/api/admin')) {
      // Exclude the login API
      if (pathname === '/api/admin/auth/login') return NextResponse.next();
      
      const session = request.cookies.get('session')?.value;
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      try {
        const secretKey = process.env.JWT_SECRET || 'secret-key-too-long-to-guess';
        const key = new TextEncoder().encode(secretKey);
        await jwtVerify(session, key);
        return NextResponse.next();
      } catch (error) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }
    
    return NextResponse.next();
  }

  // 2. Localization Logic
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  let localeToUse = pathnameIsMissingLocale ? defaultLocale : pathname.split('/')[1];

  // If path is missing locale, redirect to localized URL
  if (pathnameIsMissingLocale) {
    return NextResponse.redirect(
      new URL(
        `/${localeToUse}${pathname.startsWith('/') ? '' : '/'}${pathname}`,
        request.url
      )
    );
  }

  // 3. Admin Authentication Logic
  const adminMatch = /^\/(en|ar)\/admin(\/.*)?$/.exec(pathname);
  if (adminMatch) {
    const isLoginPage = pathname === `/${localeToUse}/admin/login`;
    const sessionCookie = request.cookies.get('session')?.value;
    
    let isAuthenticated = false;
    if (sessionCookie) {
      try {
        const secretKey = process.env.JWT_SECRET || 'secret-key-too-long-to-guess';
        const key = new TextEncoder().encode(secretKey);
        await jwtVerify(sessionCookie, key);
        isAuthenticated = true;
      } catch (e) {}
    }

    if (!isAuthenticated && !isLoginPage) {
      // Redirect to login page
      const url = request.nextUrl.clone();
      url.pathname = `/${localeToUse}/admin/login`;
      return NextResponse.redirect(url);
    }
    
    if (isAuthenticated && isLoginPage) {
      // Redirect away from login page if already logged in
      const url = request.nextUrl.clone();
      url.pathname = `/${localeToUse}/admin`;
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next).*)'],
};
