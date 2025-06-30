import { NextResponse } from 'next/server';
import { submitReview } from '@/lib/sanity.fetch';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await submitReview(body);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
} 