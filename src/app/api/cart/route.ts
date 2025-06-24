import { createClerkSupabaseClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getAuthUserId } from '@/utils/auth';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  // Debug logging for environment variables
  console.log('CLERK_SECRET_KEY is set:', !!process.env.CLERK_SECRET_KEY);

  // Debug logging for Clerk auth
  const { userId, getToken } = await auth();
  const token = await getToken();
  console.log('Clerk userId:', userId);
  console.log('Clerk token:', token);

  try {
    const userId = await getAuthUserId();
    const supabase = createClerkSupabaseClient();
    const { product_id, quantity } = await request.json();

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
  } catch (error) {
    if (error instanceof Error && error.message === "User not authenticated") {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('An unexpected error occurred:', error);
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('API /api/cart called');
    const userId = await getAuthUserId();
    console.log('userId:', userId);
    const supabase = createClerkSupabaseClient();
    const { data: cartItems, error } = await supabase
      .from('carts')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(cartItems);
  } catch (error) {
    console.error('API /api/cart error:', error, (error as any)?.stack);
    if (error instanceof Error && error.message === "User not authenticated") {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await getAuthUserId();
    const supabase = createClerkSupabaseClient();
    const { error } = await supabase
      .from('carts')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Error clearing cart:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "User not authenticated") {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('An unexpected error occurred:', error);
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
} 