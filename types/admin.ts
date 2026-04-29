export type AdminRole = 'super_admin' | 'admin' | 'moderator';

export interface AdminUser {
  id: string;
  email: string;
  password_hash: string;
  role: AdminRole;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  last_login?: string;
  is_active: boolean;
}

export interface AdminSession {
  admin: AdminUser;
  token: string;
}
