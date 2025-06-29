// Client-side auth helpers only
export interface AuthResult {
  authorized: boolean;
  userId?: string;
  isAdmin?: boolean;
  error?: string;
  status?: number;
}

// Client-side admin check helper
export function isAdminUser(user: any): boolean {
  if (!user) return false;
  
  const role = user.publicMetadata?.role;
  const adminRole = user.publicMetadata?.admin_role;
  
  return role === 'authenticated' && adminRole === 'admin';
}

// Client-side authenticated user check
export function isAuthenticatedUser(user: any): boolean {
  if (!user) return false;
  
  const role = user.publicMetadata?.role;
  return role === 'authenticated';
} 