import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export async function getAuthUserId() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }
  return userId;
}

export async function getAuthUserIdOrRedirect(redirectTo: string = '/sign-in') {
  const { userId } = await auth();
  if (!userId) {
    redirect(redirectTo);
  }
  return userId;
}

export async function getAuthData() {
  const authData = await auth();
  if (!authData.userId) {
    throw new Error("User not authenticated");
  }
  return authData;
}

export async function getCurrentUserOrThrow() {
  const user = await currentUser();
  if (!user) {
    throw new Error("User not authenticated");
  }
  return user;
}

export async function requireRole(role: string) {
  const { sessionClaims } = await auth();
  const userRole = sessionClaims?.publicMetadata?.role as string;
  
  if (userRole !== role) {
    throw new Error(`Access denied. Required role: ${role}`);
  }
  return true;
}

export async function requireAdmin() {
  return requireRole('admin');
}

export async function getUserRole(): Promise<string | null> {
  const { sessionClaims } = await auth();
  return (sessionClaims?.publicMetadata?.role as string) || null;
}

export async function isAuthenticated(): Promise<boolean> {
  const { userId } = await auth();
  return !!userId;
}

export async function getAuthUserIdSafe(): Promise<string | null> {
  const { userId } = await auth();
  return userId || null;
}

export async function getAuthUserIdForAPI() {
  const { userId } = await auth();
  if (!userId) {
    return { error: "Unauthorized", status: 401, userId: null };
  }
  return { userId, error: null, status: 200 };
}

export async function requirePermission(permission: string) {
  const { sessionClaims } = await auth();
  const permissions = sessionClaims?.publicMetadata?.permissions as string[] || [];
  
  if (!permissions.includes(permission)) {
    throw new Error(`Access denied. Required permission: ${permission}`);
  }
  return true;
}

// Type-safe metadata access
interface UserMetadata {
  role?: "admin" | "user";
  permissions?: string[];
  organizationId?: string;
}

export async function getUserMetadata(): Promise<UserMetadata> {
  const { sessionClaims } = await auth();
  return (sessionClaims?.publicMetadata as UserMetadata) || {};
}

declare global {
  interface CustomJwtSessionClaims {
    publicMetadata: UserMetadata;
  }
} 