import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { format } from "date-fns";

interface Review {
  id: string;
  rating: number;
  review_text: string | null;
  is_spoiler: boolean;
  created_at: string;
  hardcover_id: string;
  books: {
    id: string;
    title: string;
    author: string;
    coverUrl: string | null;
  } | null;
}

interface UserReviewsListProps {
  reviews: Review[];
}

export default function UserReviewsList({ reviews }: UserReviewsListProps) {
  const renderStars = (rating: number) => {
    const stars = [];
    const fullRating = rating / 2; // Convert 0-10 to 0-5 scale
    
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < fullRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }`}
        />
      );
    }
    
    return stars;
  };

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id}>
          <CardHeader>
            <div className="flex gap-4">
              {review.books ? (
                <Link href={`/books/${review.books.id}`} className="shrink-0">
                  <div className="relative w-16 h-24 bg-muted rounded overflow-hidden">
                    {review.books.coverUrl ? (
                      <Image
                        src={review.books.coverUrl}
                        alt={review.books.title}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full p-2">
                        <p className="text-xs text-muted-foreground text-center line-clamp-3">
                          {review.books.title}
                        </p>
                      </div>
                    )}
                  </div>
                </Link>
              ) : (
                <div className="shrink-0">
                  <div className="relative w-16 h-24 bg-muted rounded overflow-hidden flex items-center justify-center">
                    <p className="text-xs text-muted-foreground text-center">
                      Book
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex-1">
                {review.books ? (
                  <>
                    <Link href={`/books/${review.books.id}`} className="hover:underline">
                      <h3 className="font-semibold">{review.books.title}</h3>
                    </Link>
                    <p className="text-sm text-muted-foreground">{review.books.author}</p>
                  </>
                ) : (
                  <>
                    <h3 className="font-semibold text-muted-foreground">Book (ID: {review.hardcover_id})</h3>
                    <p className="text-sm text-muted-foreground">Book details not available</p>
                  </>
                )}
                
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1">
                    {renderStars(review.rating)}
                    <span className="text-sm text-muted-foreground ml-1">
                      {(review.rating / 2).toFixed(1)}
                    </span>
                  </div>
                  
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(review.created_at), "MMM d, yyyy")}
                  </span>
                  
                  {review.is_spoiler && (
                    <Badge variant="outline" className="text-xs">
                      Contains Spoilers
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          
          {review.review_text && (
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">
                {review.is_spoiler ? (
                  <details>
                    <summary className="cursor-pointer text-muted-foreground mb-2">
                      Click to reveal spoiler review
                    </summary>
                    {review.review_text}
                  </details>
                ) : (
                  review.review_text
                )}
              </p>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}