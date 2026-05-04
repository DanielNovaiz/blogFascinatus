import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/services/admin-auth.service';

const PUBLIC_PATHS = ['/admin/login', '/api/admin/session'];

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (shouldAllowPublicPath(pathname)) {
    return NextResponse.next();
  }

  if (!isAdminRoute(pathname)) {
    return NextResponse.next();
  }

  const isAuthenticated = await verifyAuthentication(request);
  
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  return NextResponse.next();
}

function shouldAllowPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(path => pathname.startsWith(path));
}

function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith('/admin');
}

async function verifyAuthentication(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get('adminSession')?.value;
  
  if (!token) {
    return false;
  }

  const admin = await verifySessionToken(token);
  return admin !== null;
}

export const config = {
  matcher: ['/admin/:path*']
};
