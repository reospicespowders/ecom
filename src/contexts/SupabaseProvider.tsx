'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { useSession } from '@clerk/nextjs';

type SupabaseContextType = {
  supabase: SupabaseClient | null;
};

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export const SupabaseProvider = ({ children }: { children: React.ReactNode }) => {
  const { session, isLoaded } = useSession();

  const supabase = useMemo(() => {
    if (session) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

      // When the user is signed in, create a Supabase client with the JWT from Clerk.
      return createClient(supabaseUrl, supabaseKey, {
        global: {
          fetch: async (url, options = {}) => {
            // Get the token from the session.
            // The `supabase` template is a special template that Clerk provides for Supabase.
            const clerkToken = await session.getToken({ template: 'supabase' });

            const headers = new Headers(options?.headers);
            headers.set('Authorization', `Bearer ${clerkToken}`);

            return fetch(url, { ...options, headers });
          },
        },
      });
    } else if (isLoaded) {
      // When the user is not signed in, create a public Supabase client.
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      return createClient(supabaseUrl, supabaseKey);
    }
    // While Clerk is loading, return null
    return null;

  }, [session, isLoaded]);

  return (
    <SupabaseContext.Provider value={{ supabase }}>
      {children}
    </SupabaseContext.Provider>
  );
};

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context.supabase;
}; 