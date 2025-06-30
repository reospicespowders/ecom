import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { getAuthUserIdForAPI } from '@/utils/auth';
import { auth } from '@clerk/nextjs/server';
import { getProductById } from '@/lib/sanity.fetch';

export async function POST(request: NextRequest) {
  const authResult = await getAuthUserIdForAPI();
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }
  const { userId } = authResult;

  const body = await request.json();
  const { product_id, quantity } = body;
  const supabase = createClient();

  if (!product_id || !quantity) {
    return NextResponse.json({ error: 'Missing product_id or quantity' }, { status: 400 });
  }

  const { data: existingCartItem, error: selectError } = await supabase
    .from('carts')
    .select('id, quantity')
    .eq('user_id', userId)
    .eq('product_id', product_id)
    .single();

  if (selectError && selectError.code !== 'PGRST116') {
    console.error('Error selecting from cart:', selectError);
    return NextResponse.json({ error: selectError.message }, { status: 500 });
  }

  if (existingCartItem) {
    const { error: updateError } = await supabase
      .from('carts')
      .update({ quantity: existingCartItem.quantity + quantity })
      .eq('id', existingCartItem.id);
    
    if (updateError) {
      console.error('Error updating cart:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
  } else {
    const { error: insertError } = await supabase
      .from('carts')
      .insert({ user_id: userId, product_id, quantity });

    if (insertError) {
      console.error('Error inserting into cart:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}

export async function GET(request: NextRequest) {
  const authResult = await getAuthUserIdForAPI();
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }
  const { userId } = authResult;

  const supabase = createClient();
  const { data: cartItems, error } = await supabase
    .from('carts')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Supabase error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!cartItems) {
    return NextResponse.json([]);
  }

  const detailedCartItems = await Promise.all(
    cartItems.map(async (item) => {
      const productDetails = await getProductById(item.product_id);
      return {
        ...item,
        product: productDetails,
      };
    })
  );

  return NextResponse.json(detailedCartItems);
}

export async function DELETE(request: NextRequest) {
  const authResult = await getAuthUserIdForAPI();
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }
  const { userId } = authResult;
  
  const supabase = createClient();
  const { error } = await supabase
    .from('carts')
    .delete()
    .eq('user_id', userId);

  if (error) {
    console.error('Error clearing cart:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
} 