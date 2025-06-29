import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { auth } from '@clerk/nextjs/server'

export const createClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      db: {
        schema: 'api'
      },
      global: {
        fetch: async (url, options = {}) => {
          const { getToken } = await auth();
          const supabaseToken = await getToken();

          console.log('Supabase client - JWT token available:', !!supabaseToken);
          console.log('Supabase client - JWT token length:', supabaseToken?.length || 0);

          const headers = new Headers(options?.headers);
          headers.set('Authorization', `Bearer ${supabaseToken}`);
          
          return fetch(url as RequestInfo, {
            ...options,
            headers,
          });
        },
      },
    }
  );
}; 