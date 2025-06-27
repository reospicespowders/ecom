import { NextRequest, NextResponse } from 'next/server';
import { currentUser, auth } from '@clerk/nextjs/server';
import {
  getCustomerProfile,
  updateCustomerProfile,
  createOrUpdateCustomer,
  getCustomerInteractions,
  addCustomerInteraction,
  getAllCustomers,
} from '@/utils/supabase/client';
import { createClient } from '@/utils/supabase/server';

// GET /api/customers - Get current user's customer profile
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const supabase = createClient();
    // Check for admin query param
    const url = new URL(req.url);
    const isAll = url.searchParams.get('all') === '1';
    // TEMP: Replace with real admin check
    const isAdmin = userId === process.env.ADMIN_USER_ID;
    if (isAll && isAdmin) {
      const customers = await getAllCustomers(supabase);
      return NextResponse.json(customers);
    }
    const customer = await getCustomerProfile(supabase, userId);
    return NextResponse.json(customer);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/customers - Update current user's customer profile
export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const updates = await req.json();
    const supabase = createClient();
    const customer = await updateCustomerProfile(supabase, userId, updates);
    return NextResponse.json(customer);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/customers - Create or upsert current user's customer profile
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const data = await req.json();
    const supabase = createClient();
    const customer = await createOrUpdateCustomer(supabase, { ...data, clerk_user_id: userId });
    return NextResponse.json(customer);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 