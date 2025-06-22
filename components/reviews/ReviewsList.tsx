import { fetchReviews } from "@/app/books/[id]/actions";
import { formatDistanceToNow } from "date-fns";
import { AlertCircle, ThumbsUp } from "lucide-react";

interface ReviewsListProps {
  hardcoverId: string;
}

export async function ReviewsList({
  hardcoverId,
}: ReviewsListProps) {
  const reviews = await fetchReviews(hardcoverId);

  if (reviews.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">
        No reviews yet. Be the first to review this book!
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="border-b border-border/50 last:border-0 pb-6 last:pb-0"
        >
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold">
                  {review.user?.display_name || "Anonymous"}
                </span>
                <span className="font-medium text-yellow-600 dark:text-yellow-500">
                  {review.rating}/10
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(review.created_at), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>

          {review.is_spoiler && (
            <div className="flex items-center gap-2 mb-2 text-orange-600 dark:text-orange-400">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Spoiler Warning</span>
            </div>
          )}

          {review.review_text && (
            <p
              className={`text-sm leading-relaxed ${
                review.is_spoiler
                  ? "blur-sm hover:blur-none transition-all cursor-pointer"
                  : ""
              }`}
            >
              {review.review_text}
            </p>
          )}

          <div className="flex items-center gap-4 mt-3">
            <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ThumbsUp className="w-4 h-4" />
              <span>Helpful ({review.helpful_count})</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
