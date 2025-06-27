import { createClient } from '@supabase/supabase-js'
import { useSession } from '@clerk/nextjs';

// Note: This approach requires the calling component to be a client component `use client`
// and to be wrapped in `<ClerkProvider>`.
export const useClerkSupabaseClient = () => {
  const { session } = useSession();

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!,
    {
      db: {
        schema: 'api'
      },
      global: {
        // Get the custom Supabase token from Clerk
        fetch: async (url, options = {}) => {
          if (!session) {
            // This can happen during the initial render before Clerk is loaded.
            // Returning the original fetch handles public data access gracefully.
            return fetch(url as RequestInfo, options);
          }

          const clerkToken = await session.getToken();

          const headers = new Headers(options?.headers);
          headers.set('Authorization', `Bearer ${clerkToken}`);

          return fetch(url as RequestInfo, {
            ...options,
            headers,
          });
        },
      },
    }
  );
};

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
export async function getCustomerProfile(supabase: any, clerkUserId: string): Promise<Customer | null> {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('clerk_user_id', clerkUserId)
    .single();
  if (error) throw error;
  return data;
}

// Update customer profile by Clerk user ID
export async function updateCustomerProfile(supabase: any, clerkUserId: string, updates: Partial<Customer>): Promise<Customer | null> {
  const { data, error } = await supabase
    .from('customers')
    .update(updates)
    .eq('clerk_user_id', clerkUserId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Create or update (upsert) customer
export async function createOrUpdateCustomer(supabase: any, customer: Customer): Promise<Customer | null> {
  const { data, error } = await supabase
    .from('customers')
    .upsert(customer, { onConflict: 'clerk_user_id' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Get customer interactions
export async function getCustomerInteractions(supabase: any, clerkUserId: string): Promise<CustomerInteraction[]> {
  // First, get the customer id
  const customer = await getCustomerProfile(supabase, clerkUserId);
  if (!customer) return [];
  const { data, error } = await supabase
    .from('customer_interactions')
    .select('*')
    .eq('customer_id', customer.id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

// Add customer interaction
export async function addCustomerInteraction(supabase: any, clerkUserId: string, interaction: Omit<CustomerInteraction, 'customer_id'>): Promise<CustomerInteraction | null> {
  // First, get the customer id
  const customer = await getCustomerProfile(supabase, clerkUserId);
  if (!customer) throw new Error('Customer not found');
  const { data, error } = await supabase
    .from('customer_interactions')
    .insert({ ...interaction, customer_id: customer.id })
    .select()
    .single();
  if (error) throw error;
  return data;
} 