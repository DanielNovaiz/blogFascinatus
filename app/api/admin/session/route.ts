import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { authenticateAdmin, verifySessionToken } from '@/lib/services/admin-auth.service';

export async function POST(request: NextRequest) {
  try {
    const credentials = await request.json();

    const result = await authenticateAdmin(credentials);

    if (!result.success || !result.admin || !result.token) {
      return NextResponse.json(
        { error: result.error || 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    const cookieStore = await cookies();
    cookieStore.set('adminSession', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400,
      path: '/',
    });

    return NextResponse.json(
      {
        success: true,
        admin: {
          id: result.admin.id,
          email: result.admin.email,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Erro ao conectar. Tente novamente.' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('adminSession');

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Erro ao fazer logout' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('adminSession')?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const admin = await verifySessionToken(token);
    
    if (!admin) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
    
    return NextResponse.json(
      {
        authenticated: true,
        admin: {
          id: admin.id,
          email: admin.email,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
