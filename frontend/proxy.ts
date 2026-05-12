import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ROUTES } from '@/lib/routes';

const PUBLIC_ROUTES = [ROUTES.LOGIN];

const ROLE_PROTECTED_ROUTES: Record<string, string[]> = {
  [ROUTES.USERS]: ['admin'],
  [ROUTES.PROJECTS]: ['admin', 'manager'],
  [ROUTES.DAILY_LOGS]: ['manager', 'employee'],
  [ROUTES.DASHBOARD]: ['admin', 'manager', 'employee'],
  [ROUTES.TASKS]: ['admin', 'manager', 'employee'],
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')) {
    return NextResponse.next();
  }

 
  const token = request.cookies.get('tm_access')?.value;

  if (!token) {
    const loginUrl = new URL(ROUTES.LOGIN, request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  
  const userCookie = request.cookies.get('tm_user')?.value;
  if (userCookie) {
    try {
      const user = JSON.parse(decodeURIComponent(userCookie));
      const role: string = user?.role;
      const matchedRoute = Object.keys(ROLE_PROTECTED_ROUTES).find(
        (route) => pathname === route || pathname.startsWith(route + '/')
      );
      if (matchedRoute && role) {
        const allowedRoles = ROLE_PROTECTED_ROUTES[matchedRoute];
        if (!allowedRoles.includes(role)) {
          return NextResponse.redirect(new URL(ROUTES.DASHBOARD, request.url));
        }
      }
    } catch {
      
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
