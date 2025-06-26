import { createClient } from '@/utils/supabase/server';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  // Check for user session first
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // RLS will ensure the user can only delete their own wishlist items
  const supabase = createClient();
  const { error } = await supabase
    .from('wishlist')
    .delete()
    .eq('product_id', params.productId)
    .eq('customer_id', userId);

  if (error) {
    console.error('Error removing from wishlist:', error);
    return NextResponse.json({ error: 'Failed to remove from wishlist' }, { status: 500 });
  }

  return NextResponse.json({ message: 'Product removed from wishlist' });
} 