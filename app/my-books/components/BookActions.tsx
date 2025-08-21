"use client";

import { useState } from "react";
import {
  updateBookProgress,
  updateBookStatus,
  updateBookNotes,
} from "@/app/my-books/actions";
import { type UserBook } from "@/utils/supabase";
import {
  BookOpen,
  CheckCircle2,
  Bookmark,
  Clock,
  ChevronDown, 
  MoreVertical, 
  PenSquare, 
  FileText
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const getStatusConfig = (status: UserBook["status"]) => {
  const configs = {
    reading: {
      label: "Reading",
      icon: BookOpen,
      className: "bg-blue-500 text-white",
      dotColor: "bg-blue-500",
      gradient: "from-blue-500/20 to-blue-600/20",
    },
    finished: {
      label: "Finished",
      icon: CheckCircle2,
      className: "bg-emerald-500 text-white",
      dotColor: "bg-emerald-500",
    },
    want_to_read: {
      label: "Want to Read",
      icon: Bookmark,
      className: "bg-indigo-500 text-white",
      dotColor: "bg-amber-500",
      gradient: "from-amber-500/20 to-amber-600/20",
    },
    dnf: {
      label: "DNF",
      icon: Clock,
      className: "bg-gray-500/10 text-gray-600 border-gray-200",
      dotColor: "bg-gray-500",
      gradient: "from-gray-500/20 to-gray-600/20",
    },
  };

  return configs[status] || configs.want_to_read;
};

interface BookActionsProps {
  userBook: UserBook;
  bookPageCount?: number;
}

export function BookActions({ userBook, bookPageCount }: BookActionsProps) {
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showProgressDialog, setShowProgressDialog] = useState(false);
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [progressValue, setProgressValue] = useState(
    userBook.current_page?.toString() || ""
  );
  const [notesValue, setNotesValue] = useState(userBook.notes || "");

  const statusConfig = getStatusConfig(userBook.status);
  const StatusIcon = statusConfig.icon;

  const handleUpdateProgress = async () => {
    const page = parseInt(progressValue);
    if (isNaN(page) || page < 0) return;

    setIsUpdatingProgress(true);
    const result = await updateBookProgress(userBook.id, page);
    setIsUpdatingProgress(false);

    if (result.success) {
      setShowProgressDialog(false);
    }
  };

  const handleUpdateStatus = async (newStatus: UserBook["status"]) => {
    setIsUpdatingStatus(true);
    const result = await updateBookStatus(userBook.id, newStatus);
    setIsUpdatingStatus(false);
  };

  const handleUpdateNotes = async () => {
    const result = await updateBookNotes(userBook.id, notesValue);
    if (result.success) {
      setShowNotesDialog(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Status Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={`
              inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
              transition-colors hover:opacity-90
              ${statusConfig.className}
            `}
            disabled={isUpdatingStatus}
          >
            <StatusIcon className="w-3.5 h-3.5" />
            <span>{statusConfig.label}</span>
            <ChevronDown className="w-3 h-3 ml-0.5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem 
            onClick={() => handleUpdateStatus("want_to_read")}
            disabled={userBook.status === "want_to_read"}
          >
            <Bookmark className="w-4 h-4 mr-2" />
            Want to Read
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleUpdateStatus("reading")}
            disabled={userBook.status === "reading"}
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Currently Reading
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleUpdateStatus("finished")}
            disabled={userBook.status === "finished"}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Finished
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleUpdateStatus("dnf")}
            disabled={userBook.status === "dnf"}
          >
            <Clock className="w-4 h-4 mr-2" />
            Did Not Finish
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Actions Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="p-1.5 rounded-md hover:bg-muted transition-colors">
            <MoreVertical className="w-4 h-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {userBook.status === "reading" && (
            <>
              <DropdownMenuItem onClick={() => setShowProgressDialog(true)}>
                <PenSquare className="w-4 h-4 mr-2" />
                Update Progress
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem onClick={() => setShowNotesDialog(true)}>
            <FileText className="w-4 h-4 mr-2" />
            {userBook.notes ? "Edit Notes" : "Add Notes"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Progress Dialog */}
      <Dialog open={showProgressDialog} onOpenChange={setShowProgressDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Reading Progress</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="progress">Current Page</Label>
              <Input
                id="progress"
                type="number"
                value={progressValue}
                onChange={(e) => setProgressValue(e.target.value)}
                min="0"
                max={bookPageCount || undefined}
              />
              {bookPageCount && (
                <p className="text-xs text-muted-foreground mt-1">
                  Total pages: {bookPageCount}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleUpdateProgress}
                disabled={isUpdatingProgress}
                className="flex-1"
              >
                {isUpdatingProgress ? "Updating..." : "Update"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowProgressDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Notes Dialog */}
      <Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{userBook.notes ? "Edit Notes" : "Add Notes"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notesValue}
                onChange={(e) => setNotesValue(e.target.value)}
                className="h-32 resize-none"
                placeholder="Add your thoughts about this book..."
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleUpdateNotes}
                className="flex-1"
              >
                Save Notes
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowNotesDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
