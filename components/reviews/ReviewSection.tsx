import { MessageSquare } from "lucide-react";
import { ReviewsList } from "./ReviewsList";

interface ReviewSectionProps {
  hardcoverId: string;
  bookId?: string;
  bookTitle: string;
}

export async function ReviewSection({ hardcoverId, bookId, bookTitle }: ReviewSectionProps) {
  return (
    <div className="bg-gradient-to-r from-muted/30 to-muted/20 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-border/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 sm:h-8 bg-gradient-to-b from-purple-500 to-blue-500 dark:from-purple-400 dark:to-blue-400 rounded-full" />
          <h2 className="text-xl sm:text-2xl font-bold">Community Reviews</h2>
          <MessageSquare className="w-5 h-5 text-muted-foreground" />
        </div>
      </div>

      <ReviewsList hardcoverId={hardcoverId} />
    </div>
  );
}