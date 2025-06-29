import { auth } from '@clerk/nextjs/server';

export interface AuthResult {
  authorized: boolean;
  userId?: string;
  isAdmin?: boolean;
  error?: string;
  status?: number;
}

// Server-side admin access check
export async function checkAdminAccess(): Promise<AuthResult> {
  try {
    const { userId, sessionClaims } = await auth();
    
    if (!userId) {
      return { authorized: false, error: 'Unauthorized', status: 401 };
    }

    const anyClaims = sessionClaims as any;
    const role = anyClaims?.role;
    const adminRole = anyClaims?.admin_role;
    
    // Check for proper role claims
    if (role !== 'authenticated') {
      return { authorized: false, error: 'Invalid role', status: 403 };
    }
    
    if (adminRole !== 'admin') {
      return { authorized: false, error: 'Forbidden - Admin access required', status: 403 };
    }

    return { authorized: true, userId, isAdmin: true };
  } catch (error) {
    console.error('Auth check error:', error);
    return { authorized: false, error: 'Authentication error', status: 500 };
  }
}

// Server-side authenticated user check
export async function checkAuthenticatedUser(): Promise<AuthResult> {
  try {
    const { userId, sessionClaims } = await auth();
    
    if (!userId) {
      return { authorized: false, error: 'Unauthorized', status: 401 };
    }

    const anyClaims = sessionClaims as any;
    const role = anyClaims?.role;
    const adminRole = anyClaims?.admin_role;
    
    // Check for proper role claims
    if (role !== 'authenticated') {
      return { authorized: false, error: 'Invalid role', status: 403 };
    }

    return { 
      authorized: true, 
      userId, 
      isAdmin: adminRole === 'admin' 
    };
  } catch (error) {
    console.error('Auth check error:', error);
    return { authorized: false, error: 'Authentication error', status: 500 };
  }
} 