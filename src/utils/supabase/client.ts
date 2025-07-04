'use client'

// --- Customer Service Layer ---

// TODO: Replace with actual type import when available
type Customer = {
  id: string;
  clerk_user_id: string;
  email: string;
  name: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
  status?: string;
  tags?: string[];
  notes?: string;
};

type CustomerInteraction = {
  id?: string;
  customer_id: string;
  type: string;
  details?: string;
  created_at?: string;
};

// Get customer profile by Clerk user ID
export async function getCustomerProfile(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('clerk_user_id', userId)
    .maybeSingle(); // allows null if not found
  if (error) throw error;
  return data;
}

// Update customer profile by Clerk user ID
export async function updateCustomerProfile(
  supabase: any,
  userId: string,
  updates: Partial<any>
) {
  // Check if customer exists
  const customer = await getCustomerProfile(supabase, userId);
  if (!customer) throw new Error('Customer not found');
  const { data, error } = await supabase
    .from('customers')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('clerk_user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// Create or update (upsert) customer by Clerk user ID
export async function createOrUpdateCustomer(
  supabase: any,
  data: any // should include clerk_user_id
) {
  const { data: upserted, error } = await supabase
    .from('customers')
    .upsert({ ...data, updated_at: new Date().toISOString() }, { onConflict: 'clerk_user_id' })
    .maybeSingle();
  if (error) throw error;
  return upserted;
}

// Get customer interactions (assumes customer_interactions table exists)
export async function getCustomerInteractions(supabase: any, userId: string) {
  const customer = await getCustomerProfile(supabase, userId);
  if (!customer) return [];
  const { data, error } = await supabase
    .from('customer_interactions')
    .select('*')
    .eq('customer_id', customer.id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

// Add customer interaction
export async function addCustomerInteraction(
  supabase: any,
  userId: string,
  interaction: any // { type, details, ... }
) {
  const customer = await getCustomerProfile(supabase, userId);
  if (!customer) throw new Error('Customer not found');
  const { data, error } = await supabase
    .from('customer_interactions')
    .insert({ ...interaction, customer_id: customer.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}