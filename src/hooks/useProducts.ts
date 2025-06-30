import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useProducts(category?: string, search?: string) {
  let query = '/api/products';
  const params = new URLSearchParams();

  if (category) {
    params.append('category', category);
  }
  if (search) {
    params.append('search', search);
  }

  if (params.toString()) {
    query += `?${params.toString()}`;
  }

  const { data, error, mutate } = useSWR(query, fetcher);

  return {
    products: data?.products || [],
    total: data?.total || 0,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

export function useProduct(productId: string) {
  const { data, error, mutate } = useSWR(productId ? `/api/products/${productId}` : null, fetcher);

  return {
    product: data?.product,
    inventory: data?.inventory,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
} 