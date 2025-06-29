import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { auth } from '@clerk/nextjs/server';
import { getProducts } from "@/lib/sanity.fetch";
import { checkAdminAccess } from "@/lib/server-auth-helpers";

export async function POST(req: NextRequest) {
  try {
    // Check admin access
    const authCheck = await checkAdminAccess();
    if (!authCheck.authorized) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }

    const supabase = createClient();
    
    // Get products from Sanity
    const sanityProducts = await getProducts();
    
    if (!Array.isArray(sanityProducts)) {
      return NextResponse.json({ error: 'Failed to fetch products from Sanity' }, { status: 500 });
    }

    // Transform Sanity products to inventory format
    const inventoryData = sanityProducts.map((product: any) => ({
      sanity_product_id: product._id,
      current_stock: product.quantity || 0,
      low_stock_threshold: 10, // Default threshold
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
      console.error('Error syncing inventory:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      synced: data?.length || 0,
      totalSanityProducts: sanityProducts.length,
      products: data 
    });
  } catch (error: any) {
    console.error('POST /api/products/sync error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    // Check admin access
    const authCheck = await checkAdminAccess();
    if (!authCheck.authorized) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }

    // Get preview from Sanity
    const sanityProducts = await getProducts();
    
    if (!Array.isArray(sanityProducts)) {
      return NextResponse.json({ error: 'Failed to fetch products from Sanity' }, { status: 500 });
    }

    // Transform for preview
    const previewData = sanityProducts.slice(0, 10).map((product: any) => ({
      sanity_product_id: product._id,
      title: product.title || 'Untitled Product',
      category: product.category?.name || null,
      current_stock: product.quantity || 0,
      low_stock_threshold: 10,
      image: product.image,
      price: product.price,
      brand: product.brand
    }));

    return NextResponse.json({
      totalProducts: sanityProducts.length,
      preview: previewData,
      message: `Found ${sanityProducts.length} products in Sanity CMS`
    });
  } catch (error: any) {
    console.error('GET /api/products/sync error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 