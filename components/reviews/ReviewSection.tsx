"use client";

import { useState } from "react";
import { MessageSquare, PenSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ReviewForm } from "./ReviewForm";
import { ReviewsList } from "./ReviewsList";

interface ReviewSectionProps {
  hardcoverId: string;
  bookId?: string;
  bookTitle: string;
}

export function ReviewSection({ hardcoverId, bookId, bookTitle }: ReviewSectionProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleReviewSubmitted = () => {
    setRefreshTrigger(prev => prev + 1);
    setIsDialogOpen(false);
  };

  return (
    <div className="bg-gradient-to-r from-muted/30 to-muted/20 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-border/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 sm:h-8 bg-gradient-to-b from-purple-500 to-blue-500 dark:from-purple-400 dark:to-blue-400 rounded-full" />
          <h2 className="text-xl sm:text-2xl font-bold">Community Reviews</h2>
          <MessageSquare className="w-5 h-5 text-muted-foreground" />
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white">
              <PenSquare className="w-4 h-4 mr-2" />
              Write a Review
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Review "{bookTitle}"</DialogTitle>
              <DialogDescription>
                Share your thoughts and rating for this book with the community.
              </DialogDescription>
            </DialogHeader>
            <ReviewForm 
              hardcoverId={hardcoverId} 
              bookId={bookId}
              onReviewSubmitted={handleReviewSubmitted}
            />
          </DialogContent>
        </Dialog>
      </div>

      <ReviewsList hardcoverId={hardcoverId} refreshTrigger={refreshTrigger} />
    </div>
  );
}