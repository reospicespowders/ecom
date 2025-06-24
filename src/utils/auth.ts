import { auth } from '@clerk/nextjs/server';

export function getAuthUserId() {
  const { userId } = auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }
  return userId;
} 