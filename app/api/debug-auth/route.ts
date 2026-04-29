import { createServerClient } from '@/lib/auth-utils';
import { NextResponse } from 'next/server';

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ status: 'forbidden' }, { status: 404 });
  }

  try {
    const supabase = await createServerClient();
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) throw error;

    return NextResponse.json({
      status: 'success',
      sessionExists: !!session,
      user: session?.user?.email ?? 'no-user',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        message: error.message || 'Unknown auth error',
      },
      { status: 500 }
    );
  }
}