"use client";
import React, { useState, SyntheticEvent } from 'react';
import { Rating } from 'react-simple-star-rating';

type ReviewFormProps = {
  productId: string;
  onReviewSubmitted: () => void; // Callback to refresh reviews after submission
};

const ReviewForm: React.FC<ReviewFormProps> = ({ productId, onReviewSubmitted }) => {
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerEmail, setReviewerEmail] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRating = (rate: number) => {
    setRating(rate);
  };

  const handleSubmit = async (event: SyntheticEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setSubmitting(true);

    if (!reviewerName || !comment || rating === 0) {
      setError('Please fill in all required fields (Name, Rating, Comment).');
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewerName,
          reviewerEmail,
          comment,
          rating,
          productId,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to submit review');
      }

      setSuccess(true);
      setReviewerName('');
      setReviewerEmail('');
      setRating(0);
      setComment('');
      onReviewSubmitted(); // Notify parent to refresh reviews
    } catch (err) {
      console.error("Failed to submit review:", err);
      setError('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="product__details-comment-form">
      <h4>Leave a Reply</h4>
      {success && <div className="alert alert-success">Review submitted successfully! It will appear after approval.</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        {/* Name and Email fields */}
        <div className="row">
          <div className="col-xxl-6 col-xl-6 col-lg-6">
            <div className="product__details-comment-input">
              <input
                type="text"
                placeholder="Your Name*"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="col-xxl-6 col-xl-6 col-lg-6">
            <div className="product__details-comment-input">
              <input
                type="email"
                placeholder="Your Email"
                value={reviewerEmail}
                onChange={(e) => setReviewerEmail(e.target.value)}
              />
            </div>
          </div>
        </div>
        {/* Review comment field */}
        <div className="row">
          <div className="col-xxl-12">
            <div className="product__details-comment-input">
              <textarea
                placeholder="Your Review*"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
              ></textarea>
            </div>
          </div>
        </div>
        {/* Rating field */}
        <div className="row">
          <div className="col-xxl-12">
            <div className="product__details-rating d-sm-flex align-items-center">
              <h5 className="rating-title">Your Rating:</h5>
              <div className="product-rating">
                <Rating
                  onClick={handleRating}
                  initialValue={rating}
                  SVGclassName="star-svg"
                  size={20}
                  fillColor="#FFB800"
                  emptyColor="#CCCCCC"
                />
              </div>
            </div>
          </div>
        </div>
        {/* Submit button */}
        <div className="row">
          <div className="col-xxl-12">
            <div className="product__details-comment-btn">
              <button type="submit" className="tp-btn-2" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm; 