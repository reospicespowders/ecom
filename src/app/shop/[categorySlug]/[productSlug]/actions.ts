"use server";
import { revalidatePath } from 'next/cache';

export async function revalidateProductPage(categorySlug: string, productSlug: string) {
  revalidatePath(`/shop/${categorySlug}/${productSlug}`);
} 