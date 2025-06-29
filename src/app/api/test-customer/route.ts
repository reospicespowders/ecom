import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Testing customer creation with userId:', userId);

    const supabase = createClient();

    // Test customer data
    const testCustomerData = {
      clerk_user_id: userId,
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com',
      phone: '1234567890',
      address_line_1: '123 Test St',
      address_line_2: null,
      city: 'Test City',
      state: 'Test State',
      postal_code: '12345',
      country: 'US',
      status: 'active',
      source: 'test',
      total_orders: 0,
      total_spent: 0,
      average_order_value: 0,
      last_order_date: null,
      last_contact_date: new Date().toISOString(),
      preferred_contact_method: 'email',
      notes: null,
      custom_fields: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log('Attempting to create customer with data:', testCustomerData);

    // Try to insert the customer
    const { data: customer, error } = await supabase
      .from('customers')
      .insert(testCustomerData)
      .select()
      .single();

    if (error) {
      console.error('Error creating test customer:', error);
      return NextResponse.json({ 
        error: error.message, 
        details: error,
        customerData: testCustomerData 
      }, { status: 500 });
    }

    console.log('Test customer created successfully:', customer);

    // Clean up - delete the test customer
    await supabase
      .from('customers')
      .delete()
      .eq('id', customer.id);

    return NextResponse.json({ 
      success: true, 
      message: 'Customer creation test passed',
      customer: customer 
    });

  } catch (error: any) {
    console.error('Test customer creation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 