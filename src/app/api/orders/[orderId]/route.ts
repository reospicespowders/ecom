import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { auth } from '@clerk/nextjs/server';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
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

    const { orderId } = params;
    const updates = await req.json();

    // Validate order ID
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // Only allow updating specific fields for security
    const allowedFields = ['status', 'payment_status', 'notes', 'shipped_date', 'delivered_date'];
    const filteredUpdates: any = {};
    
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    }

    // Add updated_at timestamp
    filteredUpdates.updated_at = new Date().toISOString();

    const supabase = createClient();
    
    // Update the order
    const { data, error } = await supabase
      .from("orders")
      .update(filteredUpdates)
      .eq("id", orderId)
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
      .single();
    
    if (error) {
      console.error('Error updating order:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('PATCH /api/orders/[orderId] error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
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

    const { orderId } = params;

    // Validate order ID
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const supabase = createClient();
    
    // Get the order with customer details
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
      .eq("id", orderId)
      .single();
    
    if (error) {
      console.error('Error fetching order:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('GET /api/orders/[orderId] error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 