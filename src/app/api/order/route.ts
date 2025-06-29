import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getAuthUserId } from '@/utils/auth';
import { getProductById } from '@/lib/sanity.fetch';

// Generate order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${timestamp.slice(-8)}-${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthUserId();
    const supabase = createClient();
    const { orderDetails, customerData } = await request.json();

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

    // Calculate order totals
    let subtotal = 0;
    const orderItemsWithDetails = [];

    for (const cartItem of cartItems) {
      const product = await getProductById(cartItem.product_id);
      if (product) {
        const price = product.sale_price ?? product.price;
        const itemTotal = price * cartItem.quantity;
        subtotal += itemTotal;
        
        orderItemsWithDetails.push({
          product_id: cartItem.product_id,
          quantity: cartItem.quantity,
          unit_price: price,
          total_price: itemTotal,
          product_title: product.title,
        });
      }
    }

    // Calculate shipping and tax
    const shippingAmount = orderDetails.shipping_cost || 0;
    const taxAmount = orderDetails.tax_amount || 0;
    const discountAmount = orderDetails.discount_amount || 0;
    const totalAmount = subtotal + shippingAmount + taxAmount - discountAmount;

    // Create or update customer profile first
    let customerId = null;
    if (customerData) {
      const customerProfileData = {
        clerk_user_id: userId,
        first_name: customerData.firstName,
        last_name: customerData.lastName,
        email: customerData.email,
        phone: customerData.phone,
        address_line_1: customerData.address,
        address_line_2: customerData.apartment || null,
        city: customerData.city,
        state: customerData.state,
        postal_code: customerData.zipCode,
        country: customerData.country,
        status: 'active',
        source: 'checkout',
        last_contact_date: new Date().toISOString(),
        notes: customerData.orderNote || null,
        custom_fields: {
          company: customerData.company || null,
        },
        updated_at: new Date().toISOString(),
      };

      // Upsert customer profile
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .upsert(customerProfileData, { 
          onConflict: 'clerk_user_id',
          ignoreDuplicates: false 
        })
        .select('id, total_orders, total_spent')
        .single();

      if (customerError) {
        console.error('Error creating/updating customer profile:', customerError);
        return NextResponse.json({ error: customerError.message }, { status: 500 });
      }

      customerId = customer.id;

      // Update customer order statistics
      const newTotalOrders = (customer.total_orders || 0) + 1;
      const newTotalSpent = (customer.total_spent || 0) + totalAmount;
      const newAverageOrderValue = newTotalSpent / newTotalOrders;

      await supabase
        .from('customers')
        .update({
          total_orders: newTotalOrders,
          total_spent: newTotalSpent,
          average_order_value: newAverageOrderValue,
          last_order_date: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', customerId);
    }

    // Prepare shipping and billing addresses
    const shippingAddress = {
      first_name: customerData?.firstName,
      last_name: customerData?.lastName,
      company: customerData?.company,
      address: customerData?.address,
      apartment: customerData?.apartment,
      city: customerData?.city,
      state: customerData?.state,
      postal_code: customerData?.zipCode,
      country: customerData?.country,
      phone: customerData?.phone,
      email: customerData?.email,
    };

    // Use shipping address as billing address for now
    const billingAddress = { ...shippingAddress };

    // Create order with new schema
    const orderData = {
      customer_id: customerId,
      order_number: generateOrderNumber(),
      status: 'pending',
      currency: 'USD',
      subtotal: subtotal,
      tax_amount: taxAmount,
      shipping_amount: shippingAmount,
      discount_amount: discountAmount,
      total_amount: totalAmount,
      order_date: new Date().toISOString(),
      shipping_address: shippingAddress,
      billing_address: billingAddress,
      payment_status: 'pending',
      payment_method: null,
      notes: customerData?.orderNote || null,
      metadata: {
        clerk_user_id: userId,
        source: 'checkout',
        cart_items_count: cartItems.length,
        ...orderDetails.metadata,
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select('id, order_number')
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      return NextResponse.json({ error: orderError.message }, { status: 500 });
    }

    // Create order items (assuming you have an order_items table)
    const orderItems = orderItemsWithDetails.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
      product_title: item.product_title,
    }));

    // Insert order items if order_items table exists
    try {
      const { error: orderItemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (orderItemsError) {
        console.error('Error creating order items:', orderItemsError);
        // Don't fail the order if order items fail
      }
    } catch (error) {
      console.error('Order items table might not exist:', error);
      // Continue without order items for now
    }

    // Clear cart
    await supabase.from('carts').delete().eq('user_id', userId);

    return NextResponse.json({ 
      success: true, 
      orderId: order.id,
      orderNumber: order.order_number,
      customerId: customerId,
      total: totalAmount,
    });

  } catch (error) {
    if (error instanceof Error && error.message === "User not authenticated") {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('An unexpected error occurred:', error);
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
} 