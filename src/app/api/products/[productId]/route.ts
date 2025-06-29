import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { auth } from '@clerk/nextjs/server';
import { getProductById } from "@/lib/sanity.fetch";
import { checkAdminAccess, checkAuthenticatedUser } from "@/lib/server-auth-helpers";

// Types for better type safety
interface InventoryUpdate {
  current_stock?: number;
  low_stock_threshold?: number;
  reason?: string;
  quantity?: number;
  movement_type?: 'sale' | 'restock' | 'adjustment' | 'reservation' | 'release';
  order_id?: string;
}

interface SanityProduct {
  _id: string;
  title: string;
  price: number;
  sale_price?: number;
  sku?: string;
  category?: {
    _id: string;
    name: string;
    slug: string;
  };
  quantity?: number;
  image?: string;
  gallery?: string[];
  description?: string;
  brand?: string;
  status?: string;
  slug?: string;
}

// GET - Enhanced to work for both admin and regular users
export async function GET(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const { userId, sessionClaims } = await auth();
    const { productId } = params;

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const supabase = createClient();
    
    // Check admin role
    const anyClaims = sessionClaims as any;
    const role = anyClaims?.role;
    const adminRole = anyClaims?.admin_role;
    const isAdmin = role === 'authenticated' && adminRole === 'admin';

    // Get product data from Sanity first
    const sanityProduct: SanityProduct = await getProductById(productId);

    if (!sanityProduct) {
      return NextResponse.json({ error: 'Product not found in catalog' }, { status: 404 });
    }

    // Get inventory data from Supabase
    let query = supabase
      .from("product_inventory")
      .select(`
        id,
        sanity_product_id,
        current_stock,
        reserved_stock,
        available_stock,
        low_stock_threshold,
        last_updated,
        ${isAdmin ? `
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
        )` : ''}
      `)
      .eq("sanity_product_id", productId);

    // Always fetch a single record
    const { data: inventoryData, error } = await query.single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching product inventory:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Combine Sanity product data with inventory data
    const response = {
      product: sanityProduct,
      inventory: inventoryData || {
        sanity_product_id: productId,
        current_stock: 0,
        reserved_stock: 0,
        available_stock: 0,
        low_stock_threshold: 0,
        in_stock: false
      }
    };

    // Calculate availability for regular users
    if (!isAdmin) {
      const inv = response.inventory && typeof response.inventory === 'object' ? response.inventory : {};
      const availableStock = (inv as any).available_stock || 0;
      response.inventory = {
        ...inv,
        in_stock: availableStock > 0,
        // Don't expose exact stock numbers to regular users for competitive reasons
        stock_level: availableStock > 10 ? 'high' : 
                    availableStock > 5 ? 'medium' : 
                    availableStock > 0 ? 'low' : 'out_of_stock'
      } as any;
      delete (response.inventory as any).current_stock;
      delete (response.inventory as any).reserved_stock;
      delete (response.inventory as any).available_stock;
    }
    
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('GET /api/products/[productId] error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Enhanced for different user roles and operations
export async function PATCH(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const { userId, sessionClaims } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId } = params;
    const updates: InventoryUpdate = await req.json();

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Check admin role
    const anyClaims = sessionClaims as any;
    const role = anyClaims?.role;
    const adminRole = anyClaims?.admin_role;
    const isAdmin = role === 'authenticated' && adminRole === 'admin';

    const supabase = createClient();
    
    // Different operations based on user role and request type
    if (isAdmin) {
      // Admin operations - full inventory management
      return handleAdminOperation(supabase, productId, updates, userId);
    } else {
      // Regular user operations - stock reservation/purchase
      return handleUserOperation(supabase, productId, updates, userId);
    }
  } catch (error: any) {
    console.error('PATCH /api/products/[productId] error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Admin operations (stock adjustments, restocking, etc.)
async function handleAdminOperation(
  supabase: any,
  productId: string,
  updates: InventoryUpdate,
  userId: string
) {
  const { data: result, error: transactionError } = await supabase.rpc('update_inventory_with_movement', {
    p_product_id: productId,
    p_new_stock: updates.current_stock,
    p_new_threshold: updates.low_stock_threshold,
    p_reason: updates.reason || 'Manual stock adjustment',
    p_admin_user_id: userId,
    p_movement_type: updates.movement_type || 'adjustment'
  });

  if (transactionError) {
    console.error('Error in inventory update transaction:', transactionError);
    return NextResponse.json({ error: transactionError.message }, { status: 500 });
  }

  if (!result || result.length === 0) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }
  
  return NextResponse.json(result[0]);
}

// User operations (reservations, purchases)
async function handleUserOperation(
  supabase: any,
  productId: string,
  updates: InventoryUpdate,
  userId: string
) {
  const { movement_type, quantity, order_id } = updates;

  if (!movement_type || !quantity) {
    return NextResponse.json({ 
      error: 'movement_type and quantity are required for user operations' 
    }, { status: 400 });
  }

  let rpcFunction = '';
  let rpcParams: any = {
    p_sanity_product_id: productId,
    p_quantity: quantity,
    p_user_id: userId
  };

  switch (movement_type) {
    case 'reservation':
      rpcFunction = 'reserve_stock';
      rpcParams.p_order_id = order_id;
      break;
    case 'sale':
      rpcFunction = 'complete_sale';
      rpcParams.p_order_id = order_id;
      break;
    case 'release':
      rpcFunction = 'release_reservation';
      rpcParams.p_order_id = order_id;
      break;
    default:
      return NextResponse.json({ 
        error: 'Invalid movement_type for user operation' 
      }, { status: 400 });
  }

  const { data: result, error } = await supabase.rpc(rpcFunction, rpcParams);

  if (error) {
    console.error(`Error in ${rpcFunction}:`, error);
    
    // Handle specific business logic errors
    if (error.message.includes('Insufficient stock')) {
      return NextResponse.json({ 
        error: 'Insufficient stock available',
        available_stock: error.details?.available_stock || 0
      }, { status: 409 });
    }
    
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(result);
}

// POST - Create new inventory record for Sanity product
export async function POST(
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
    const role = anyClaims?.role;
    const adminRole = anyClaims?.admin_role;
    
    if (role !== 'authenticated' || adminRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { productId } = params;
    const { initial_stock = 0, low_stock_threshold = 5 } = await req.json();

    // Verify product exists in Sanity
    const sanityProduct = await getProductById(productId);

    if (!sanityProduct) {
      return NextResponse.json({ error: 'Product not found in catalog' }, { status: 404 });
    }

    const supabase = createClient();
    
    const { data, error } = await supabase
      .from("product_inventory")
      .insert({
        sanity_product_id: productId,
        current_stock: initial_stock,
        reserved_stock: 0,
        available_stock: initial_stock,
        low_stock_threshold,
        created_by: userId
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating inventory record:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Create initial movement record
    if (initial_stock > 0) {
      await supabase
        .from("inventory_movements")
        .insert({
          product_inventory_id: data.id,
          movement_type: 'restock',
          quantity: initial_stock,
          reason: 'Initial stock',
          admin_user_id: userId,
          previous_stock: 0,
          new_stock: initial_stock
        });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('POST /api/products/[productId] error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 