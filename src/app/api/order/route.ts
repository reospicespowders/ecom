import { NextRequest, NextResponse } from 'next/server';
import { createClerkSupabaseClient } from '@/utils/supabase/server';
import { getAuthUserId } from '@/utils/auth';
import { getProductById } from '@/lib/sanity.fetch';

export async function POST(request: NextRequest) {
  try {
    const userId = getAuthUserId();
    const supabase = createClerkSupabaseClient();
    const { orderDetails } = await request.json();

    const { data: cartItems, error: cartError } = await supabase
      .from('carts')
      .select('product_id, quantity')
      .eq('user_id', userId);

    if (cartError) {
      return NextResponse.json({ error: cartError.message }, { status: 500 });
    }

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // This should be in a transaction in a real app
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        ...orderDetails,
      })
      .select('id')
      .single();

    if (orderError) {
      return NextResponse.json({ error: orderError.message }, { status: 500 });
    }

    const orderItems = cartItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
    }));

    const { error: orderItemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (orderItemsError) {
      return NextResponse.json({ error: orderItemsError.message }, { status: 500 });
    }

    await supabase.from('carts').delete().eq('user_id', userId);

    return NextResponse.json({ success: true, orderId: order.id });

  } catch (error) {
    if (error instanceof Error && error.message === "User not authenticated") {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('An unexpected error occurred:', error);
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
} 