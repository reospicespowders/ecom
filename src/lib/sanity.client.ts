import { createClient } from 'next-sanity'

export const client = createClient({
  projectId: '11csziy5',
  dataset: 'production',
  apiVersion: '2024-03-13',
  useCdn: false,
}) 