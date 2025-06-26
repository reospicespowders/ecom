import { createClient } from '@/utils/supabase/server';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from('wishlist')
    .select('product_id')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { product_id } = await request.json();
  if (!product_id) {
    return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from('wishlist')
    .insert({ user_id: userId, product_id })
    .select();

  if (error) {
    if (error.code === '23505') { // unique_violation
      return NextResponse.json({ message: 'Product already in wishlist' }, { status: 409 });
    }
    console.error('Error adding to wishlist:', error);
    return NextResponse.json({ error: 'Failed to add to wishlist' }, { status: 500 });
  }

  return NextResponse.json({ message: 'Product added to wishlist', data: data[0] }, { status: 201 });
} 