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

    if (lowStock) {
      query = query.lte("current_stock", supabase.raw("low_stock_threshold"));
    }

    if (search) {
      query = query.or(`product_title.ilike.%${search}%,category.ilike.%${search}%`);
    }

    const { data, error } = await query;
    
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

    const { products } = await req.json();
    
    if (!Array.isArray(products)) {
      return NextResponse.json({ error: 'Products array is required' }, { status: 400 });
    }

    const supabase = createClient();
    
    // Prepare products for bulk insert/update
    const inventoryData = products.map((product: any) => ({
      sanity_product_id: product.sanity_product_id,
      product_title: product.product_title,
      category: product.category,
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
  const supabase = createClient();
  const body = await req.json();
  const { id, ...update } = body;
  const { data, error } = await supabase
    .from("product_inventory")
    .update(update)
    .eq("id", id)
    .select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data[0]);
} 