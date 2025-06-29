import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/utils/supabase/server';

// GET /api/customers/profile - Get current user's customer profile
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient();
    
    // Get customer profile by Clerk user ID
    const { data: customer, error } = await supabase
      .from('customers')
      .select('*')
      .eq('clerk_user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching customer profile:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(customer);
    
  } catch (error: any) {
    console.error('GET /api/customers/profile error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/customers/profile - Create or update customer profile during checkout
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.json();
    const supabase = createClient();

    // Map checkout form data to customer schema
    const customerData = {
      clerk_user_id: userId,
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      address_line_1: formData.address,
      address_line_2: formData.apartment || null,
      city: formData.city,
      state: formData.state,
      postal_code: formData.zipCode,
      country: formData.country,
      status: 'active',
      source: 'checkout',
      total_orders: 0,
      total_spent: 0,
      average_order_value: 0,
      last_order_date: null,
      last_contact_date: new Date().toISOString(),
      preferred_contact_method: 'email',
      notes: formData.orderNote || null,
      custom_fields: {
        company: formData.company || null,
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Upsert customer profile (create if doesn't exist, update if exists)
    const { data: customer, error } = await supabase
      .from('customers')
      .upsert(customerData, { 
        onConflict: 'clerk_user_id',
        ignoreDuplicates: false 
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating/updating customer profile:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(customer);
    
  } catch (error: any) {
    console.error('POST /api/customers/profile error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/customers/profile - Update customer profile
export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updates = await req.json();
    const supabase = createClient();

    // Add updated_at timestamp
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const { data: customer, error } = await supabase
      .from('customers')
      .update(updateData)
      .eq('clerk_user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating customer profile:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(customer);
    
  } catch (error: any) {
    console.error('PUT /api/customers/profile error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 