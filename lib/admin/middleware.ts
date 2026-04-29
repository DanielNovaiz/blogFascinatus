import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAdminSession } from './auth';

export async function adminMiddleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Rotas públicas do admin
  const publicPaths = ['/admin/login'];
  if (publicPaths.some(p => path.startsWith(p))) {
    return NextResponse.next();
  }

  // Rotas protegidas do admin
  if (path.startsWith('/admin')) {
    try {
      const session = await getAdminSession();
      if (!session) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
    } catch {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}
