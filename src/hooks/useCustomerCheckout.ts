import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';

interface CustomerProfile {
  id: string;
  clerk_user_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  address_line_1: string | null;
  address_line_2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  status: string;
  source: string | null;
  total_orders: number | null;
  total_spent: number | null;
  average_order_value: number | null;
  last_order_date: string | null;
  last_contact_date: string | null;
  preferred_contact_method: string | null;
  notes: string | null;
  custom_fields: Record<string, any> | null;
  created_at: string | null;
  updated_at: string | null;
}

interface CheckoutFormData {
  firstName: string;
  lastName: string;
  company?: string;
  country: string;
  address: string;
  city: string;
  apartment?: string;
  state: string;
  zipCode: string;
  email: string;
  phone: string;
  orderNote?: string;
}

export function useCustomerCheckout() {
  const { user, isLoaded: isUserLoaded, isSignedIn } = useUser();
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch existing customer profile
  const fetchCustomerProfile = useCallback(async () => {
    if (!isSignedIn || !user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/customers/profile');
      if (!response.ok) {
        if (response.status === 404) {
          // Customer profile doesn't exist yet - this is normal for new users
          setCustomerProfile(null);
          return;
        }
        throw new Error(`Failed to fetch customer profile: ${response.statusText}`);
      }

      const profile = await response.json();
      setCustomerProfile(profile);
    } catch (err) {
      console.error('Error fetching customer profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch customer profile');
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn, user]);

  // Create or update customer profile during checkout
  const createOrUpdateProfile = async (formData: CheckoutFormData): Promise<CustomerProfile> => {
    try {
      setError(null);

      const response = await fetch('/api/customers/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Failed to create/update customer profile: ${response.statusText}`);
      }

      const profile = await response.json();
      setCustomerProfile(profile);
      return profile;
    } catch (err) {
      console.error('Error creating/updating customer profile:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create/update customer profile';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Update customer profile
  const updateProfile = async (updates: Partial<CustomerProfile>): Promise<CustomerProfile> => {
    try {
      setError(null);

      const response = await fetch('/api/customers/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`Failed to update customer profile: ${response.statusText}`);
      }

      const profile = await response.json();
      setCustomerProfile(profile);
      return profile;
    } catch (err) {
      console.error('Error updating customer profile:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update customer profile';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Map customer profile to checkout form data
  const getFormDataFromProfile = (): Partial<CheckoutFormData> => {
    if (!customerProfile) return {};

    return {
      firstName: customerProfile.first_name || '',
      lastName: customerProfile.last_name || '',
      company: customerProfile.custom_fields?.company || '',
      country: customerProfile.country || '',
      address: customerProfile.address_line_1 || '',
      apartment: customerProfile.address_line_2 || '',
      city: customerProfile.city || '',
      state: customerProfile.state || '',
      zipCode: customerProfile.postal_code || '',
      email: customerProfile.email || '',
      phone: customerProfile.phone || '',
      orderNote: customerProfile.notes || '',
    };
  };

  // Fetch profile when user is loaded
  useEffect(() => {
    if (isUserLoaded && isSignedIn) {
      fetchCustomerProfile();
    } else if (isUserLoaded && !isSignedIn) {
      setIsLoading(false);
    }
  }, [isUserLoaded, isSignedIn, user?.id, fetchCustomerProfile]);

  return {
    customerProfile,
    isLoading,
    error,
    fetchCustomerProfile,
    createOrUpdateProfile,
    updateProfile,
    getFormDataFromProfile,
    hasProfile: !!customerProfile,
  };
} 