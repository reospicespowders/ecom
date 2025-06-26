import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { getAuthUserId } from '@/utils/auth'

console.error('test2');


export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

    const supabase = createClient();
    const body = await request.json();
    const { quantity } = body;
    const cartItemId = params.id;

    if (!quantity || quantity <= 0) {
      return NextResponse.json({ error: 'Quantity must be a positive number' }, { status: 400 })
    }

    console.error('test145');

    const { data, error } = await supabase
      .from('carts')
      .update({ quantity })
      .eq('id', cartItemId)
      .select()
      .single()

      console.error('test1');

    if (error) {
      console.error('Error updating cart item:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating cart item:', error)
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 })
  }
}

console.error('test4');


export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

    const supabase = createClient();
    const cartItemId = params.id;

    const { error } = await supabase
      .from('carts')
      .delete()
      .eq('id', cartItemId)

    if (error) {
      console.error('Error deleting cart item:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('An unexpected error occurred:', error)
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 })
  }
} 

console.error('test3');
