"use client";

import { useState, useEffect } from "react";
import { Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  submitReview,
  updateReview,
  deleteReview,
} from "@/app/books/[id]/actions";

interface ReviewFormProps {
  hardcoverId: string;
  bookId?: string;
  onReviewSubmitted?: () => void;
  existingReview?: {
    id: string;
    rating: number;
    review_text: string | null;
    is_spoiler: boolean;
  } | null;
}

export function ReviewForm({
  hardcoverId,
  bookId,
  onReviewSubmitted,
  existingReview,
}: ReviewFormProps) {
  const [rating, setRating] = useState<string>("");
  const [reviewText, setReviewText] = useState("");
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-populate form with existing review data
  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating.toString());
      setReviewText(existingReview.review_text || "");
      setIsSpoiler(existingReview.is_spoiler);
    }
  }, [existingReview]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const ratingNum = parseFloat(rating);

    if (!rating || isNaN(ratingNum) || ratingNum < 0 || ratingNum > 10) {
      setError("Please enter a rating between 0 and 10");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (existingReview) {
        // Update existing review
        await updateReview(existingReview.id, ratingNum, reviewText, isSpoiler);
      } else {
        // Submit new review
        await submitReview(
          hardcoverId,
          bookId,
          ratingNum,
          reviewText,
          isSpoiler
        );
      }

      // Reset form only for new reviews
      if (!existingReview) {
        setRating("");
        setReviewText("");
        setIsSpoiler(false);
      }

      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      setError(
        existingReview
          ? "Failed to update review. Please try again."
          : "Failed to submit review. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!existingReview) return;

    setIsDeleting(true);
    setError(null);

    try {
      await deleteReview(existingReview.id);

      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (err) {
      console.error("Error deleting review:", err);
      setError("Failed to delete review. Please try again.");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="rating" className="text-base font-semibold mb-2 block">
            Your Rating (0-10)
          </Label>
          <div className="flex items-center gap-4">
            <input
              id="rating"
              type="number"
              min="0"
              max="10"
              step="0.1"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              placeholder="7.5"
              className="w-24 px-3 py-2 text-lg font-semibold text-center border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-gray-800 dark:border-gray-700"
            />
            <div className="flex items-center gap-1">
              {rating && !isNaN(parseFloat(rating)) && (
                <>
                  {[...Array(10)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(parseFloat(rating))
                          ? "fill-yellow-500 text-yellow-500"
                          : i < parseFloat(rating)
                          ? "fill-yellow-500/50 text-yellow-500"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </>
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            You can use decimals like 7.5 or 8.3
          </p>
        </div>

        <div>
          <Label htmlFor="review" className="text-base font-semibold mb-2 block">
            Your Review (optional)
          </Label>
          <Textarea
            id="review"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Share your thoughts about this book..."
            rows={4}
            className="resize-none"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="spoiler"
            checked={isSpoiler}
            onCheckedChange={(checked) => setIsSpoiler(checked as boolean)}
          />
          <Label
            htmlFor="spoiler"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            This review contains spoilers
          </Label>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={
              isSubmitting || isDeleting || !rating || isNaN(parseFloat(rating))
            }
            className="flex-1 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600"
          >
            {isSubmitting
              ? existingReview
                ? "Updating..."
                : "Submitting..."
              : existingReview
              ? "Update Review"
              : "Submit Review"}
          </Button>

          {existingReview && (
            <Button
              type="button"
              variant="destructive"
              disabled={isSubmitting || isDeleting}
              onClick={() => setShowDeleteConfirm(true)}
              className="px-3"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </form>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
          <div className="bg-background rounded-lg p-6 w-80 mx-4">
            <h3 className="font-semibold mb-4">Delete Review</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Are you sure you want to delete this review? This action cannot be
              undone. The book will remain in your library as finished.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={handleDelete}
                disabled={isDeleting}
                variant="destructive"
                className="flex-1"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
              <Button
                onClick={() => setShowDeleteConfirm(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
