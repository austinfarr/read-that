"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Heart, 
  BookOpen, 
  Clock, 
  CheckCircle, 
  ChevronDown,
  X
} from "lucide-react";
import { addToBookshelf, removeFromBookshelf } from "@/app/books/[id]/actions";

interface BookStatusActionsProps {
  hardcoverId: string;
  bookId?: string;
  currentStatus: 'want_to_read' | 'reading' | 'finished' | null;
  onStatusChange?: () => void;
}

export function BookStatusActions({ 
  hardcoverId, 
  bookId, 
  currentStatus, 
  onStatusChange 
}: BookStatusActionsProps) {
  const [isPending, startTransition] = useTransition();

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

  const getStatusButton = () => {
    const loading = isPending;
    
    if (!currentStatus) {
      // Not in library - show "Add to Library" dropdown
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white"
              disabled={loading}
            >
              <Heart className="w-4 h-4 mr-2" />
              Add to Library
              <ChevronDown className="w-4 h-4 ml-2" />
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
            <DropdownMenuItem onClick={() => handleStatusChange('finished')}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Finished
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    // Book is in library - show current status with dropdown to change
    const statusConfig = {
      want_to_read: {
        icon: Heart,
        label: "Want to Read",
        className: "bg-purple-500 hover:bg-purple-600"
      },
      reading: {
        icon: Clock,
        label: "Reading",
        className: "bg-blue-500 hover:bg-blue-600"
      },
      finished: {
        icon: CheckCircle,
        label: "Finished",
        className: "bg-green-500 hover:bg-green-600"
      }
    };

    const config = statusConfig[currentStatus];
    const Icon = config.icon;

    return (
      <div className="flex gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              className={`${config.className} text-white`}
              disabled={loading}
            >
              <Icon className="w-4 h-4 mr-2" />
              {config.label}
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {currentStatus !== 'want_to_read' && (
              <DropdownMenuItem onClick={() => handleStatusChange('want_to_read')}>
                <Heart className="w-4 h-4 mr-2" />
                Want to Read
              </DropdownMenuItem>
            )}
            {currentStatus !== 'reading' && (
              <DropdownMenuItem onClick={() => handleStatusChange('reading')}>
                <Clock className="w-4 h-4 mr-2" />
                Currently Reading
              </DropdownMenuItem>
            )}
            {currentStatus !== 'finished' && (
              <DropdownMenuItem onClick={() => handleStatusChange('finished')}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Finished
              </DropdownMenuItem>
            )}
            <DropdownMenuItem 
              onClick={handleRemove}
              className="text-red-600 focus:text-red-600"
            >
              <X className="w-4 h-4 mr-2" />
              Remove from Library
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  return getStatusButton();
}