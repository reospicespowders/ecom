import useSWR from "swr";

// Enhanced fetcher with better error handling
const fetcher = async (url: string) => {
  const res = await fetch(url);
  
  // Handle different response statuses
  if (res.status === 404) {
    return null; // Customer not found - return null instead of throwing
  }
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `HTTP ${res.status}`);
  }
  
  return res.json();
};

export function useCustomerProfile() {
  const { data, error, mutate, isLoading } = useSWR("/api/customers/profile", fetcher, {
    // Don't retry on 404s since that's expected for new users
    shouldRetryOnError: (error) => {
      return !error.message.includes('404');
    },
    // Revalidate less frequently for customer profiles
    revalidateOnFocus: false,
    dedupingInterval: 60000, // 1 minute
  });

  return {
    customer: data,
    isLoading,
    isError: !!error,
    error: error?.message,
    mutate,
    // Helper to check if customer exists
    hasProfile: data !== null && data !== undefined,
  };
}

export async function updateCustomerProfile(updates: any) {
  const res = await fetch("/api/customers", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Failed to update profile' }));
    throw new Error(errorData.error || 'Failed to update profile');
  }
  
  return res.json();
}

export async function createCustomerProfile(customerData: any) {
  const res = await fetch("/api/customers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(customerData),
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Failed to create profile' }));
    throw new Error(errorData.error || 'Failed to create profile');
  }
  
  return res.json();
}

// Hook for updating customer profile with optimistic updates
export function useCustomerProfileMutation() {
  const { mutate } = useCustomerProfile();
  
  const updateProfile = async (updates: any) => {
    try {
      // Optimistically update the cache
      mutate(
        (currentData: any) => currentData ? { ...currentData, ...updates } : null,
        false // Don't revalidate immediately
      );
      
      // Make the actual API call
      const updatedCustomer = await updateCustomerProfile(updates);
      
      // Update cache with server response
      mutate(updatedCustomer);
      
      return updatedCustomer;
    } catch (error) {
      // Revert optimistic update on error
      mutate();
      throw error;
    }
  };
  
  const createProfile = async (customerData: any) => {
    try {
      const newCustomer = await createCustomerProfile(customerData);
      mutate(newCustomer);
      return newCustomer;
    } catch (error) {
      throw error;
    }
  };
  
  return {
    updateProfile,
    createProfile,
  };
}

// For admin/management interface - fetches all customers from the new endpoint
export function useAllCustomers() {
  const { data, error, mutate, isLoading } = useSWR(
    "/api/customers/all", // Updated endpoint for admin
    fetcher,
    {
      // Less frequent revalidation for customer lists
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
    }
  );
  
  return {
    customers: data || [],
    isLoading,
    isError: !!error,
    error: error?.message,
    mutate,
  };
}

// Hook for customer profile with auto-creation
export function useCustomerProfileWithAutoCreate(initialData?: any) {
  const { customer, isLoading, isError, error, mutate, hasProfile } = useCustomerProfile();
  const { createProfile } = useCustomerProfileMutation();
  
  // Auto-create profile if it doesn't exist and we have initial data
  const ensureProfile = async (userData: any) => {
    if (!hasProfile && !isLoading) {
      try {
        return await createProfile(userData);
      } catch (error) {
        console.error('Failed to auto-create customer profile:', error);
        throw error;
      }
    }
    return customer;
  };
  
  return {
    customer,
    isLoading,
    isError,
    error,
    hasProfile,
    mutate,
    ensureProfile,
  };
}