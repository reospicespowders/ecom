import { createClient } from 'next-sanity'

// Check if we're in a browser environment and if the token exists
const isClient = typeof window !== 'undefined';
const hasToken = process.env.NEXT_PUBLIC_SANITY_TOKEN;

// Only create the client if we have a token
let client: any = null;

if (hasToken) {
  client = createClient({
    projectId: '11csziy5',
    dataset: 'production',
    apiVersion: '2024-03-13',
    useCdn: false,
    token: hasToken,
    perspective: 'published',
  });
}

// Create a safe client that only works when token is available
export const getSafeClient = () => {
  if (!hasToken) {
    throw new Error('Sanity token not configured. Please check your NEXT_PUBLIC_SANITY_TOKEN environment variable.');
  }
  if (!client) {
    throw new Error('Sanity client not initialized. Please check your configuration.');
  }
  return client;
}

// Export the client only if it exists
export { client }; 