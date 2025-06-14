"use client";
import React from 'react';
import { IReview } from '@/types/product-d-t';
import { Rating } from 'react-simple-star-rating';
import { format } from 'date-fns';

interface ReviewDisplayProps {
  reviews: IReview[];
}

const ReviewDisplay: React.FC<ReviewDisplayProps> = ({ reviews }) => {
  if (!reviews || reviews.length === 0) {
    return <p>No reviews yet. Be the first to review this product!</p>;
  }

  // Filter out null/undefined reviews and reviews that are not approved
  const approvedReviews = reviews.filter(review => review && review.approved);

  if (approvedReviews.length === 0) {
    return <p>No approved reviews yet. Check back later!</p>;
  }

  return (
    <div className="product__details-comment-tab-content pt-30">
      {approvedReviews.map((review) => (
        <div className="product__details-comment-item d-sm-flex align-items-start"
          key={review._id}
        >
          <div className="product__details-comment-thumb mr-20">
            <img src="/assets/img/product/comment/comment-1.jpg" alt="comment-thumb" /> {/* Placeholder, consider dynamic avatars if available */}
          </div>
          <div className="product__details-comment-content">
            <div className="product__details-comment-top d-sm-flex align-items-start justify-content-between">
              <div className="product__details-comment-info">
                <h6>{review.reviewerName}</h6>
                <div className="product__details-comment-rating">
                  <Rating
                    initialValue={review.rating}
                    readonly={true}
                    size={16}
                    fillColor="#FFB800"
                    emptyColor="#CCCCCC"
                    SVGclassName="star-svg"
                  />
                </div>
              </div>
              <div className="product__details-comment-date">
                <span>{format(new Date(review._createdAt), 'MMMM dd, yyyy')}</span>
              </div>
            </div>
            <p>{review.comment}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReviewDisplay; 