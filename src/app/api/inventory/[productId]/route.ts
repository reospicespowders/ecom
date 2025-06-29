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
    const adminRole = anyClaims?.admin_role;
    
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
    const adminRole = anyClaims?.admin_role;
    
    if (adminRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { productId } = params;
    const updates = await req.json();

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const supabase = createClient();
    
    // Get current inventory data
    const { data: currentInventory, error: fetchError } = await supabase
      .from("product_inventory")
      .select("*")
      .eq("id", productId)
      .single();

    if (fetchError) {
      console.error('Error fetching current inventory:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    // Calculate stock change
    const stockChange = updates.current_stock - currentInventory.current_stock;
    
    // Prepare inventory update
    const inventoryUpdate = {
      current_stock: updates.current_stock,
      low_stock_threshold: updates.low_stock_threshold,
      last_updated: new Date().toISOString(),
    };

    // Update inventory
    const { data: updatedInventory, error: updateError } = await supabase
      .from("product_inventory")
      .update(inventoryUpdate)
      .eq("id", productId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating inventory:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Log movement if stock changed
    if (stockChange !== 0) {
      const movementData = {
        product_id: productId,
        movement_type: 'manual',
        quantity: stockChange,
        reason: updates.reason || 'Manual stock adjustment',
        admin_user_id: userId,
        previous_stock: currentInventory.current_stock,
        new_stock: updates.current_stock,
      };

      const { error: movementError } = await supabase
        .from("inventory_movements")
        .insert(movementData);

      if (movementError) {
        console.error('Error logging movement:', movementError);
        // Don't fail the update if movement logging fails
      }
    }
    
    return NextResponse.json(updatedInventory);
  } catch (error: any) {
    console.error('PATCH /api/inventory/[productId] error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 