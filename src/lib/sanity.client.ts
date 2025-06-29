import { createClient } from 'next-sanity'

// Check if we're in a browser environment and if the token exists
const isClient = typeof window !== 'undefined';
const hasToken = process.env.NEXT_PUBLIC_SANITY_TOKEN;

export const client = createClient({
  projectId: '11csziy5',
  dataset: 'production',
  apiVersion: '2024-03-13',
  useCdn: false,
  token: hasToken || undefined, // Only use token if it exists
  perspective: 'published',
})

// Create a safe client that only works when token is available
export const getSafeClient = () => {
  if (!hasToken) {
    throw new Error('Sanity token not configured');
  }
  return client;
} 