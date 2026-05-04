import { SignJWT, jwtVerify } from 'jose';
import { supabase } from '@/lib/supabase';
import * as bcrypt from 'bcryptjs';

const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'fallback-secret-change-in-production'
);

export interface AdminUser {
  id: string;
  email: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  admin?: AdminUser;
  token?: string;
  error?: string;
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (hash.startsWith('$2b$')) {
    return await bcrypt.compare(password, hash);
  }
  
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const sha256Hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return sha256Hash === hash;
}

async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12);
}

async function createSessionToken(adminId: string, email: string): Promise<string> {
  return await new SignJWT({ adminId, email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
}

async function validateCredentials(credentials: LoginCredentials): Promise<AdminUser | null> {
  const { data: admin, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('email', credentials.email)
    .eq('is_active', true)
    .single();

  if (error || !admin) {
    return null;
  }

  const isValid = await verifyPassword(credentials.password, admin.password_hash);
  
  if (!isValid) {
    return null;
  }

  if (!admin.password_hash.startsWith('$2b$')) {
    const newHash = await hashPassword(credentials.password);
    await supabase
      .from('admin_users')
      .update({ password_hash: newHash })
      .eq('id', admin.id);
  }

  return {
    id: admin.id,
    email: admin.email,
  };
}

export async function authenticateAdmin(credentials: LoginCredentials): Promise<AuthResult> {
  if (!credentials.email || !credentials.password) {
    return {
      success: false,
      error: 'Email e senha são obrigatórios',
    };
  }

  try {
    const admin = await validateCredentials(credentials);
    
    if (!admin) {
      return {
        success: false,
        error: 'Credenciais inválidas',
      };
    }

    const token = await createSessionToken(admin.id, admin.email);

    return {
      success: true,
      admin,
      token,
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return {
      success: false,
      error: 'Erro ao conectar. Tente novamente.',
    };
  }
}

export async function verifySessionToken(token: string): Promise<AdminUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      id: payload.adminId as string,
      email: payload.email as string,
    };
  } catch {
    return null;
  }
}
