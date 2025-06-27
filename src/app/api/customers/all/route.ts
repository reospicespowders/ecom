import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getAllCustomers } from '@/utils/supabase/client';
import { createClient } from '@/utils/supabase/server';

export async function GET(req: NextRequest) {
  const { userId, sessionClaims } = await auth();
  // Check for admin role in JWT session claims
  if (sessionClaims?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  const supabase = createClient();
  const customers = await getAllCustomers(supabase);
  return NextResponse.json(customers);
} 