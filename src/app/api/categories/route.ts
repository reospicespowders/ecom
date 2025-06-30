import { NextResponse } from 'next/server';
import { fetchCategories } from '@/lib/sanity.fetch';

export async function GET() {
  try {
    const categories = await fetchCategories();
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
} 