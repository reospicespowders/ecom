import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { auth } from '@clerk/nextjs/server';
import { getProducts } from "@/lib/sanity.fetch";
import { checkAdminAccess, checkAuthenticatedUser } from "@/lib/server-auth-helpers";

export async function GET(req: NextRequest) {
  try {
    const authResult = await checkAuthenticatedUser();
    
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const supabase = createClient();
    
    // Check admin role
    const isAdmin = authResult.isAdmin;
    
    // Get URL parameters for filtering
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const lowStock = searchParams.get('lowStock') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Get products from Sanity
    const sanityProducts = await getProducts();
    
    if (!Array.isArray(sanityProducts)) {
      return NextResponse.json({ error: 'Failed to fetch products from Sanity' }, { status: 500 });
    }

    // Filter products based on search and category
    let filteredProducts = sanityProducts;
    
    if (search) {
      filteredProducts = filteredProducts.filter((product: any) =>
        product.title?.toLowerCase().includes(search.toLowerCase()) ||
        product.sku?.toLowerCase().includes(search.toLowerCase()) ||
        product.brand?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (category) {
      filteredProducts = filteredProducts.filter((product: any) =>
        product.category?.name === category
      );
    }

    // Get inventory data for all products
    const productIds = filteredProducts.map((p: any) => p._id);
    
    let inventoryQuery = supabase
      .from("product_inventory")
      .select("sanity_product_id, current_stock, available_stock, low_stock_threshold, last_updated")
      .in("sanity_product_id", productIds);

    const { data: inventoryData, error: inventoryError } = await inventoryQuery;
    
    if (inventoryError) {
      console.error('Error fetching inventory:', inventoryError);
      return NextResponse.json({ error: inventoryError.message }, { status: 500 });
    }

    // Filter low stock items in JavaScript if needed
    let filteredInventoryData = inventoryData;
    if (lowStock && isAdmin) {
      filteredInventoryData = inventoryData?.filter((item: any) => 
        item.current_stock <= item.low_stock_threshold
      );
    }

    // Create inventory lookup map
    const inventoryMap = new Map();
    (filteredInventoryData || []).forEach((item: any) => {
      inventoryMap.set(item.sanity_product_id, item);
    });

    // Combine Sanity products with inventory data
    let combinedProducts = filteredProducts.map((product: any) => {
      const inventory = inventoryMap.get(product._id) || {
        current_stock: 0,
        available_stock: 0,
        low_stock_threshold: 10,
        last_updated: null
      };

      const combined = {
        ...product,
        inventory: {
          ...inventory,
          in_stock: inventory.available_stock > 0,
          stock_level: inventory.available_stock > 10 ? 'high' : 
                      inventory.available_stock > 5 ? 'medium' : 
                      inventory.available_stock > 0 ? 'low' : 'out_of_stock',
          low_stock: inventory.current_stock <= inventory.low_stock_threshold
        }
      };

      // For non-admin users, don't expose exact stock numbers
      if (!isAdmin) {
        delete combined.inventory.current_stock;
        delete combined.inventory.available_stock;
      }

      return combined;
    });

    // Apply low stock filter for non-admin users
    if (lowStock && !isAdmin) {
      combinedProducts = combinedProducts.filter((product: any) => 
        product.inventory.stock_level === 'low' || product.inventory.stock_level === 'out_of_stock'
      );
    }

    // Pagination
    const totalProducts = combinedProducts.length;
    const paginatedProducts = combinedProducts.slice(offset, offset + limit);

    // Get categories for filtering
    const categories = [...new Set(sanityProducts.map((p: any) => p.category?.name).filter(Boolean))];

    return NextResponse.json({
      products: paginatedProducts,
      pagination: {
        page,
        limit,
        total: totalProducts,
        totalPages: Math.ceil(totalProducts / limit)
      },
      filters: {
        categories,
        search,
        category,
        lowStock
      },
      stats: {
        totalProducts: sanityProducts.length,
        inStock: combinedProducts.filter((p: any) => p.inventory.in_stock).length,
        lowStock: combinedProducts.filter((p: any) => p.inventory.low_stock).length,
        outOfStock: combinedProducts.filter((p: any) => !p.inventory.in_stock).length
      }
    });
  } catch (error: any) {
    console.error('GET /api/products error:', error);
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
    console.error('POST /api/products error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 