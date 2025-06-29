import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { auth } from '@clerk/nextjs/server';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient();
    
    // First get the customer profile for this user
    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("id")
      .eq("clerk_user_id", userId)
      .single();

    if (customerError) {
      console.error('Error fetching customer profile:', customerError);
      return NextResponse.json({ error: 'Customer profile not found' }, { status: 404 });
    }

    // Then get all orders for this customer
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("*")
      .eq("customer_id", customer.id)
      .order("created_at", { ascending: false });
    
    if (ordersError) {
      console.error('Error fetching user orders:', ordersError);
      return NextResponse.json({ error: ordersError.message }, { status: 500 });
    }
    
    return NextResponse.json(orders || []);
  } catch (error: any) {
    console.error('GET /api/orders/user error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 