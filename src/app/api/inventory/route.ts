import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { auth } from '@clerk/nextjs/server';

// Helper function to check admin access
async function checkAdminAccess() {
  const { userId, sessionClaims } = await auth();
  
  if (!userId) {
    return { authorized: false, error: 'Unauthorized', status: 401 };
  }

  // Check for admin role in public_metadata (matches RLS policy)
  const anyClaims = sessionClaims as any;
  const adminRole = anyClaims?.public_metadata?.admin_role || anyClaims?.admin_role;
  
  if (adminRole !== 'admin') {
    return { authorized: false, error: 'Forbidden - Admin access required', status: 403 };
  }

  return { authorized: true, userId };
}

export async function GET(req: NextRequest) {
  try {
    // Check admin access
    const authCheck = await checkAdminAccess();
    if (!authCheck.authorized) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }

    const supabase = createClient();
    
    // Get URL parameters for filtering
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const lowStock = searchParams.get('lowStock') === 'true';
    const search = searchParams.get('search');

    let query = supabase
      .from("product_inventory")
      .select("*")
      .order("product_title", { ascending: true });

    // Apply filters
    if (category) {
      query = query.eq("category", category);
    }

    if (search) {
      query = query.ilike("product_title", `%${search}%`);
    }

    let data, error;

    if (lowStock) {
      // Query the view for low stock products
      ({ data, error } = await supabase
        .from("low_stock_products")
        .select("*")
        .order("product_title", { ascending: true }));
    } else {
      // Query the main table
      ({ data, error } = await query);
    }
    
    if (error) {
      console.error('Error fetching inventory:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error('GET /api/inventory error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Check admin access
    const authCheck = await checkAdminAccess();
    if (!authCheck.authorized) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }

    const { products } = await req.json();
    
    if (!Array.isArray(products)) {
      return NextResponse.json({ error: 'Products array is required' }, { status: 400 });
    }

    const supabase = createClient();
    
    // Prepare products for bulk insert/update
    const inventoryData = products.map((product: any) => ({
      sanity_product_id: product.sanity_product_id,
      product_title: product.product_title,
      category: product.category || null,
      current_stock: product.current_stock || 0,
      low_stock_threshold: product.low_stock_threshold || 10,
    }));

    // Use upsert to handle both insert and update
    const { data, error } = await supabase
      .from("product_inventory")
      .upsert(inventoryData, { 
        onConflict: 'sanity_product_id',
        ignoreDuplicates: false 
      })
      .select();
    
    if (error) {
      console.error('Error bulk updating inventory:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      updated: data?.length || 0,
      products: data 
    });
  } catch (error: any) {
    console.error('POST /api/inventory error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    // ✅ Added missing auth check
    const authCheck = await checkAdminAccess();
    if (!authCheck.authorized) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }

    const supabase = createClient();
    const body = await req.json();
    const { id, ...update } = body;

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("product_inventory")
      .update(update)
      .eq("id", id)
      .select();
    
    if (error) {
      console.error('Error updating inventory:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    return NextResponse.json(data[0]);
  } catch (error: any) {
    console.error('PUT /api/inventory error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 