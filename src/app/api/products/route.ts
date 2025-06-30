import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getProducts } from "@/lib/sanity.fetch";

// GET /api/products - List products with inventory info
export async function GET(req: NextRequest) {
  try {
    // Parse query params for filtering (e.g., category, search, inStock)
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const inStock = searchParams.get('inStock');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Fetch all products from Sanity
    let products = await getProducts();
    if (!Array.isArray(products)) products = [];

    // Filter by category if provided
    if (category) {
      products = products.filter((p: any) => p.category?.slug === category || p.category?.name === category);
    }
    // Filter by search if provided
    if (search) {
      const q = search.toLowerCase();
      products = products.filter((p: any) =>
        p.title?.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q)
      );
    }

    // Pagination
    const paginatedProducts = products.slice(offset, offset + limit);
    const sanityIds = paginatedProducts.map((p: any) => p._id);

    // Fetch inventory for these products from Supabase
    const supabase = createClient();
    const { data: inventoryRows, error } = await supabase
      .from('product_inventory')
      .select('*')
      .in('sanity_product_id', sanityIds);
    if (error) {
      console.error('Error fetching inventory:', error);
    }
    const inventoryMap = new Map(
      (inventoryRows || []).map((inv: any) => [inv.sanity_product_id, inv])
    );

    // Merge product and inventory info
    const result = paginatedProducts.map((product: any) => {
      const inventory = inventoryMap.get(product._id) || {
        current_stock: 0,
        reserved_stock: 0,
        available_stock: 0,
        low_stock_threshold: 0,
        in_stock: false
      };
      // Optionally filter by inStock param
      if (inStock === 'true' && (inventory.available_stock || 0) <= 0) return null;
      if (inStock === 'false' && (inventory.available_stock || 0) > 0) return null;
      return {
        ...product,
        inventory: {
          ...inventory,
          in_stock: (inventory.available_stock || 0) > 0
        }
      };
    }).filter(Boolean);

    return NextResponse.json({
      total: products.length,
      count: result.length,
      products: result
    });
  } catch (error: any) {
    console.error('GET /api/products error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 