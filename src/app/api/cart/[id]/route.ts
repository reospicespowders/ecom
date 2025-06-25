import { NextRequest, NextResponse } from 'next/server'
import { createClerkSupabaseClient } from '@/utils/supabase/server'
import { getAuthUserId } from '@/utils/auth'

console.error('test2');


export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await getAuthUserId() // just to check auth
    const supabase = createClerkSupabaseClient()
    const { quantity } = await request.json()
    const cartItemId = params.id

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
    if (error instanceof Error && error.message === "User not authenticated") {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('An unexpected error occurred:', error)
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 })
  }
}

console.error('test4');


export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await getAuthUserId() // just to check auth
    const supabase = createClerkSupabaseClient()
    const cartItemId = params.id

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
    if (error instanceof Error && error.message === "User not authenticated") {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('An unexpected error occurred:', error)
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 })
  }
} 

console.error('test3');
