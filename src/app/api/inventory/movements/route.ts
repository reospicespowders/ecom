import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { auth } from '@clerk/nextjs/server';

export async function GET(req: NextRequest) {
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

    const supabase = createClient();
    
    // Get URL parameters for filtering
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const movementType = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from("inventory_movements")
      .select(`
        *,
        product_inventory(
          id,
          product_title,
          category
        )
      `)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (productId) {
      query = query.eq("product_id", productId);
    }

    if (movementType) {
      query = query.eq("movement_type", movementType);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching inventory movements:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error('GET /api/inventory/movements error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 