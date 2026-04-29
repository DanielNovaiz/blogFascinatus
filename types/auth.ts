export interface AuthUser {
  id: string;
  email: string;
  user_metadata?: Record<string, any>;
}

export interface LoginFormData {
  email: string;
  password: string;
}
