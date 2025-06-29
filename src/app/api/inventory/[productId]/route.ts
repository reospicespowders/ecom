import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { auth } from '@clerk/nextjs/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const { userId, sessionClaims } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check for admin role
    const anyClaims = sessionClaims as any;
    const adminRole = anyClaims?.public_metadata?.admin_role || anyClaims?.admin_role;
    
    if (adminRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { productId } = params;

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const supabase = createClient();
    
    // Get product inventory with movements
    const { data, error } = await supabase
      .from("product_inventory")
      .select(`
        *,
        inventory_movements(
          id,
          movement_type,
          quantity,
          reason,
          order_id,
          admin_user_id,
          previous_stock,
          new_stock,
          created_at
        )
      `)
      .eq("id", productId)
      .single();
    
    if (error) {
      console.error('Error fetching product inventory:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('GET /api/inventory/[productId] error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const { userId, sessionClaims } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check for admin role
    const anyClaims = sessionClaims as any;
    const adminRole = anyClaims?.public_metadata?.admin_role || anyClaims?.admin_role;
    
    if (adminRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { productId } = params;
    const updates = await req.json();

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const supabase = createClient();
    
    // Use a transaction for better consistency
    const { data: result, error: transactionError } = await supabase.rpc('update_inventory_with_movement', {
      p_product_id: productId,
      p_new_stock: updates.current_stock,
      p_new_threshold: updates.low_stock_threshold,
      p_reason: updates.reason || 'Manual stock adjustment',
      p_admin_user_id: userId
    });

    if (transactionError) {
      console.error('Error in inventory update transaction:', transactionError);
      return NextResponse.json({ error: transactionError.message }, { status: 500 });
    }

    if (!result || result.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    return NextResponse.json(result[0]);
  } catch (error: any) {
    console.error('PATCH /api/inventory/[productId] error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 