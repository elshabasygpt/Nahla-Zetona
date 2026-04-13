import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secretKey = process.env.JWT_SECRET || 'secret-key-too-long-to-guess';
const key = new TextEncoder().encode(secretKey);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Protect /profile and /checkout and /admin (excluding login)
  const isProtectedUserRoute = pathname.includes('/profile') || pathname.includes('/checkout');
  const isAdminRoute = pathname.includes('/admin') && !pathname.includes('/admin/login') && !pathname.includes('/api/');
  
  if (isProtectedUserRoute || isAdminRoute) {
    const sessionToken = request.cookies.get('session')?.value;
    
    if (!sessionToken) {
      const url = request.nextUrl.clone();
      const lang = pathname.split('/')[1] || 'ar'; // fallback to ar
      url.pathname = `/${lang}/login`;
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
    
    try {
      const { payload } = await jwtVerify(sessionToken, key, { algorithms: ['HS256'] });
      
      // If it's an admin route, ensure role is admin
      if (isAdminRoute && payload.role !== 'ADMIN') {
        const url = request.nextUrl.clone();
        const lang = pathname.split('/')[1] || 'ar';
        url.pathname = `/${lang}/profile`; // redirect to user profile if not admin
        return NextResponse.redirect(url);
      }
      
      return NextResponse.next();
    } catch (err) {
      // Invalid token
      const url = request.nextUrl.clone();
      const lang = pathname.split('/')[1] || 'ar';
      url.pathname = `/${lang}/login`;
      url.searchParams.set('callbackUrl', pathname);
      // Clean up invalid cookie
      const response = NextResponse.redirect(url);
      response.cookies.delete('session');
      return response;
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
