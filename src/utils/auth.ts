import { auth } from '@clerk/nextjs/server';

export async function getAuthUserId() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }
  return userId;
} 