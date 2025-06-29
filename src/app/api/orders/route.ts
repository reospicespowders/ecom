import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { auth } from '@clerk/nextjs/server';

export async function GET(req: NextRequest) {
  try {
    const { userId, sessionClaims } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check for admin role in JWT session claims
    const anyClaims = sessionClaims as any;
    const adminRole = anyClaims?.admin_role;
    
    if (adminRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("orders")
      .select(`
        *,
        customer:customers(
          id,
          first_name,
          last_name,
          email,
          phone
        )
      `)
    .order("created_at", { ascending: false });
    
    if (error) {
      console.error('Error fetching orders:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
  return NextResponse.json(data);
  } catch (error: any) {
    console.error('GET /api/orders error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 