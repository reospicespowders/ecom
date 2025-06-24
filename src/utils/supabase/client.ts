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
      global: {
        // Get the custom Supabase token from Clerk
        fetch: async (url, options = {}) => {
          if (!session) {
            // This can happen during the initial render before Clerk is loaded.
            // Returning the original fetch handles public data access gracefully.
            return fetch(url, options);
          }

          const clerkToken = await session.getToken();

          const headers = new Headers(options?.headers);
          headers.set('Authorization', `Bearer ${clerkToken}`);

          return fetch(url, {
            ...options,
            headers,
          });
        },
      },
    }
  );
}; 