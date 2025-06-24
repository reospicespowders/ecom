import { createClient } from '@supabase/supabase-js'
import { auth } from '@clerk/nextjs/server'

export const createClerkSupabaseClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        fetch: async (url, options = {}) => {
          const { getToken } = auth();
          const supabaseToken = await getToken();

          const headers = new Headers(options?.headers);
          headers.set('Authorization', `Bearer ${supabaseToken}`);
          
          return fetch(url, {
            ...options,
            headers,
          });
        },
      },
    }
  );
}; 