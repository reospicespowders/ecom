import { NextResponse } from 'next/server';
import { getProducts, getProductsByCategory } from '@/lib/sanity.fetch';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  try {
    if (category) {
      const products = await getProductsByCategory(category);
      return NextResponse.json(products);
    } else {
      const products = await getProducts();
      return NextResponse.json(products);
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
} 