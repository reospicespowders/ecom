// Stripe integration helpers for customer management and payments

export interface StripeCustomerData {
  email: string;
  name: string;
  phone?: string;
  address?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  metadata?: {
    clerk_user_id: string;
    customer_id: string;
    source: string;
  };
}

export interface StripePaymentIntentData {
  amount: number; // in cents
  currency: string;
  customer_id?: string;
  metadata?: {
    order_id: string;
    order_number: string;
    customer_id: string;
    clerk_user_id: string;
  };
  description?: string;
  receipt_email?: string;
}

/**
 * Prepare customer data for Stripe customer creation
 */
export function prepareStripeCustomerData(
  customerProfile: any,
  clerkUserId: string
): StripeCustomerData {
  return {
    email: customerProfile.email,
    name: `${customerProfile.first_name} ${customerProfile.last_name}`,
    phone: customerProfile.phone || undefined,
    address: customerProfile.address_line_1 ? {
      line1: customerProfile.address_line_1,
      line2: customerProfile.address_line_2 || undefined,
      city: customerProfile.city,
      state: customerProfile.state,
      postal_code: customerProfile.postal_code,
      country: customerProfile.country,
    } : undefined,
    metadata: {
      clerk_user_id: clerkUserId,
      customer_id: customerProfile.id,
      source: customerProfile.source || 'checkout',
    },
  };
}

/**
 * Prepare payment intent data for Stripe
 */
export function preparePaymentIntentData(
  orderData: any,
  customerProfile: any,
  clerkUserId: string
): StripePaymentIntentData {
  return {
    amount: Math.round(orderData.total_amount * 100), // Convert to cents
    currency: orderData.currency?.toLowerCase() || 'usd',
    customer_id: orderData.stripe_customer_id, // Will be set after customer creation
    metadata: {
      order_id: orderData.id,
      order_number: orderData.order_number,
      customer_id: customerProfile.id,
      clerk_user_id: clerkUserId,
    },
    description: `Order ${orderData.order_number} - ${customerProfile.first_name} ${customerProfile.last_name}`,
    receipt_email: customerProfile.email,
  };
}

/**
 * Format address for Stripe from checkout form data
 */
export function formatAddressForStripe(address: any) {
  return {
    line1: address.address,
    line2: address.apartment || undefined,
    city: address.city,
    state: address.state,
    postal_code: address.zipCode,
    country: address.country,
  };
}

/**
 * Format address for Stripe from order shipping_address
 */
export function formatOrderAddressForStripe(shippingAddress: any) {
  return {
    line1: shippingAddress.address,
    line2: shippingAddress.apartment || undefined,
    city: shippingAddress.city,
    state: shippingAddress.state,
    postal_code: shippingAddress.postal_code,
    country: shippingAddress.country,
  };
}

/**
 * Validate customer data for Stripe
 */
export function validateCustomerDataForStripe(customerData: any): boolean {
  return !!(
    customerData.email &&
    customerData.firstName &&
    customerData.lastName &&
    customerData.address &&
    customerData.city &&
    customerData.state &&
    customerData.zipCode &&
    customerData.country
  );
}

/**
 * Create customer metadata for tracking
 */
export function createCustomerMetadata(
  clerkUserId: string,
  customerId: string,
  source: string = 'checkout'
) {
  return {
    clerk_user_id: clerkUserId,
    customer_id: customerId,
    source,
    created_at: new Date().toISOString(),
  };
}

/**
 * Prepare order metadata for Stripe
 */
export function prepareOrderMetadata(
  orderId: string,
  orderNumber: string,
  customerId: string,
  clerkUserId: string
) {
  return {
    order_id: orderId,
    order_number: orderNumber,
    customer_id: customerId,
    clerk_user_id: clerkUserId,
    source: 'checkout',
  };
} 