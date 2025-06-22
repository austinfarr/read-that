"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
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
  Heart, 
  Clock, 
  CheckCircle, 
  ChevronDown,
  X,
  Star
} from "lucide-react";
import { addToBookshelf, removeFromBookshelf } from "@/app/books/[id]/actions";
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
  const [isPending, startTransition] = useTransition();
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);

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

  const handleReviewSubmitted = () => {
    setIsReviewDialogOpen(false);
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
            className="bg-purple-500 hover:bg-purple-600 text-white rounded-r-none flex-1"
          >
            <Heart className="w-4 h-4 mr-2" />
            Want to Read
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                disabled={loading}
                className="bg-purple-500 hover:bg-purple-600 text-white rounded-l-none border-l border-purple-400 px-2"
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
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-r-none flex-1 border border-purple-500 shadow-md"
          >
            <Heart className="w-4 h-4 mr-2 fill-current" />
            ✓ Want to Read
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700 text-white rounded-l-none border-l border-purple-500 px-2 border border-purple-500 shadow-md"
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
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-r-none flex-1"
          >
            <Clock className="w-4 h-4 mr-2" />
            Reading
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
              <DropdownMenuItem onClick={() => handleStatusChange('want_to_read')}>
                <Heart className="w-4 h-4 mr-2" />
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
                <Heart className="w-4 h-4 mr-2" />
                Want to Read
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange('reading')}>
                <Clock className="w-4 h-4 mr-2" />
                Currently Reading
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Status Button */}
      {getStatusButton()}
      
      {/* Rate This Book Button */}
      <Button 
        onClick={() => setIsReviewDialogOpen(true)}
        variant="outline"
        disabled={loading}
        className="w-full border-yellow-500/30 hover:border-yellow-500 hover:bg-yellow-500/10"
      >
        <Star className="w-4 h-4 mr-2" />
        Rate this book
      </Button>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Review "{bookTitle}"</DialogTitle>
            <DialogDescription>
              Share your thoughts and rating for this book with the community.
              This will mark the book as finished in your library.
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
  );
}