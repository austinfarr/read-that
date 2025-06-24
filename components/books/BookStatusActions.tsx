"use client";

import { useState, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Clock, 
  CheckCircle, 
  ChevronDown,
  X,
  Star,
  Check
} from "lucide-react";
import { addToBookshelf, removeFromBookshelf, getUserReview } from "@/app/books/[id]/actions";
import { ReviewForm } from "@/components/reviews/ReviewForm";

interface BookStatusActionsProps {
  hardcoverId: string;
  bookId?: string;
  bookTitle: string;
  currentStatus: 'want_to_read' | 'reading' | 'finished' | null;
  onStatusChange?: () => void;
}

export function BookStatusActions({ 
  hardcoverId, 
  bookId, 
  bookTitle,
  currentStatus, 
  onStatusChange 
}: BookStatusActionsProps) {
  const { authUser, loading: authLoading } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [existingReview, setExistingReview] = useState<{ id: string; rating: number; review_text: string | null; is_spoiler: boolean } | null>(null);
  const [isLoadingReview, setIsLoadingReview] = useState(true);

  // Load existing review on component mount (only if authenticated)
  useEffect(() => {
    if (!authUser) {
      setIsLoadingReview(false);
      return;
    }

    const loadExistingReview = async () => {
      try {
        const review = await getUserReview(hardcoverId);
        setExistingReview(review);
      } catch (error) {
        console.error("Error loading existing review:", error);
      } finally {
        setIsLoadingReview(false);
      }
    };

    loadExistingReview();
  }, [hardcoverId, authUser]);

  const handleStatusChange = async (status: 'want_to_read' | 'reading' | 'finished') => {
    startTransition(async () => {
      try {
        await addToBookshelf(hardcoverId, bookId, status);
        if (onStatusChange) {
          onStatusChange();
        }
      } catch (error) {
        console.error("Error updating book status:", error);
      }
    });
  };

  const handleRemove = async () => {
    startTransition(async () => {
      try {
        await removeFromBookshelf(hardcoverId);
        if (onStatusChange) {
          onStatusChange();
        }
      } catch (error) {
        console.error("Error removing book:", error);
      }
    });
  };

  const handleReviewSubmitted = async () => {
    setIsReviewDialogOpen(false);
    
    // Refresh the existing review data
    try {
      const review = await getUserReview(hardcoverId);
      setExistingReview(review);
    } catch (error) {
      console.error("Error refreshing review data:", error);
    }
    
    if (onStatusChange) {
      onStatusChange();
    }
  };

  const loading = isPending;

  // Get the appropriate button for the reading status
  const getStatusButton = () => {
    if (!currentStatus) {
      // Not in library - show "Want to Read" button
      return (
        <div className="flex">
          <Button 
            onClick={() => handleStatusChange('want_to_read')}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-r-none flex-1"
          >
            Want to Read
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-l-none border-l border-blue-400 px-2"
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => handleStatusChange('reading')}>
                <Clock className="w-4 h-4 mr-2" />
                Currently Reading
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange('finished')}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Finished
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    }

    if (currentStatus === 'want_to_read') {
      return (
        <div className="flex">
          <Button 
            onClick={handleRemove}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-r-none flex-1 border border-blue-500 shadow-md"
          >
            <Check className="w-4 h-4 mr-2" />
            Want to Read
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-l-none border-l border-blue-500 px-2 border border-blue-500 shadow-md"
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => handleStatusChange('reading')}>
                <Clock className="w-4 h-4 mr-2" />
                Currently Reading
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange('finished')}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Finished
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    }

    if (currentStatus === 'reading') {
      return (
        <div className="flex">
          <Button 
            disabled={loading}
            className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-r-none flex-1"
          >
            <Clock className="w-4 h-4 mr-2" />
            Reading
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                disabled={loading}
                className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-l-none border-l border-indigo-400 px-2"
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => handleStatusChange('want_to_read')}>
                <Check className="w-4 h-4 mr-2" />
                Want to Read
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange('finished')}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Finished
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    }

    if (currentStatus === 'finished') {
      return (
        <div className="flex">
          <Button 
            disabled={loading}
            className="bg-green-500 hover:bg-green-600 text-white rounded-r-none flex-1"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Finished
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                disabled={loading}
                className="bg-green-500 hover:bg-green-600 text-white rounded-l-none border-l border-green-400 px-2"
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => handleStatusChange('want_to_read')}>
                <Check className="w-4 h-4 mr-2" />
                Want to Read
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange('reading')}>
                <Clock className="w-4 h-4 mr-2" />
                Currently Reading
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleRemove} className="text-red-600 focus:text-red-600">
                <X className="w-4 h-4 mr-2" />
                Remove from Library
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    }
  };

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className="flex flex-col gap-2 w-full">
        <Button disabled className="w-full">
          Loading...
        </Button>
        <Button variant="outline" disabled className="w-full">
          <Star className="w-4 h-4 mr-2" />
          Loading...
        </Button>
      </div>
    );
  }

  // Show login prompt for non-authenticated users
  if (!authUser) {
    return (
      <div className="flex flex-col gap-2 w-full">
        <Link href="/login">
          <Button className="w-full bg-blue-500 hover:bg-blue-600">
            Sign in to add to library
          </Button>
        </Link>
        <Link href="/login">
          <Button variant="outline" className="w-full border-yellow-500/30 hover:border-yellow-500 hover:bg-yellow-500/10">
            <Star className="w-4 h-4 mr-2" />
            Sign in to rate
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Status Button */}
      {getStatusButton()}
      
      {/* Rate This Book Button */}
      <Button 
        onClick={() => setIsReviewDialogOpen(true)}
        variant="outline"
        disabled={loading || isLoadingReview}
        className="w-full border-yellow-500/30 hover:border-yellow-500 hover:bg-yellow-500/10"
      >
        <Star className="w-4 h-4 mr-2" />
        {isLoadingReview 
          ? "Loading..." 
          : existingReview 
            ? `Update rating (${existingReview.rating}/10)` 
            : "Rate this book"
        }
      </Button>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {existingReview ? `Update Review for "${bookTitle}"` : `Review "${bookTitle}"`}
            </DialogTitle>
            <DialogDescription>
              {existingReview 
                ? "Update your thoughts and rating for this book."
                : "Share your thoughts and rating for this book with the community. This will mark the book as finished in your library."
              }
            </DialogDescription>
          </DialogHeader>
          <ReviewForm 
            hardcoverId={hardcoverId} 
            bookId={bookId}
            onReviewSubmitted={handleReviewSubmitted}
            existingReview={existingReview}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}