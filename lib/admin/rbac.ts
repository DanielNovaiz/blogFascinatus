import type { AdminRole } from '@/types/admin';

type Permission = 'view_all' | 'edit_products' | 'delete_products' | 'manage_orders' | 'view_dashboard' | 'manage_chats' | 'manage_admins';

const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  super_admin: [
    'view_all',
    'edit_products',
    'delete_products',
    'manage_orders',
    'view_dashboard',
    'manage_chats',
    'manage_admins',
  ],
  admin: [
    'view_all',
    'edit_products',
    'delete_products',
    'manage_orders',
    'view_dashboard',
    'manage_chats',
  ],
  moderator: [
    'view_all',
    'edit_products',
    'manage_orders',
    'view_dashboard',
    'manage_chats',
  ],
};

export function hasPermission(role: AdminRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function requirePermission(role: AdminRole, permission: Permission): void {
  if (!hasPermission(role, permission)) {
    throw new Error('FORBIDDEN');
  }
}

export function getPermissions(role: AdminRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}
