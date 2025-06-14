import { IProductData, IReview } from "@/types/product-d-t";

// calculate discount
export function discountPercentage(originalPrice: number, salePrice: number) {
  const discount = ((originalPrice - salePrice) / originalPrice) * 100;
  return discount;
}


export function isHot(updateDate: Date | string) {
  const updatedAt = new Date(updateDate);
  const currentDate = new Date();

  // Calculate the difference in milliseconds
  const timeDifference = currentDate.getTime() - updatedAt.getTime();

  // Calculate the difference in days
  const daysDifference = timeDifference / (1000 * 3600 * 24);

  // Check if the product is updated within the last month (30 days)
  const isHot = daysDifference < 30;

  return isHot;
}

// Get max price
export function maxPrice(products: IProductData[]): number {
  if (!products || products.length === 0) {
    return 0; // Return 0 if there are no products
  }
  const max_price = products.reduce((max, product) => {
    return product.price > max ? product.price : max;
  }, 0);
  return max_price
}


export const averageRating = (reviews: IReview[]) => {
  if (!reviews || reviews.length === 0) {
    return 0;
  }

  // Filter out null/undefined reviews and reviews that are not approved
  const approvedReviews = reviews.filter(review => review && review.approved);

  if (approvedReviews.length === 0) {
    return 0; // No approved reviews, so average is 0
  }

  const totalRating = approvedReviews.reduce((sum, review) => {
    // Ensure review and review.rating exist and are numbers before summing
    const rating = typeof review?.rating === 'number' ? review.rating : 0;
    return sum + rating;
  }, 0);

  const avgRating = totalRating / approvedReviews.length;

  return avgRating;
};
