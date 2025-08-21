"use client";

import { useState } from "react";
import {
  updateBookProgress,
  updateBookStatus,
  updateBookNotes,
} from "@/app/my-books/actions";
import { type UserBook } from "@/utils/supabase";

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

  const handleMarkFinished = async () => {
    setIsUpdatingStatus(true);
    const result = await updateBookStatus(userBook.id, "finished");
    setIsUpdatingStatus(false);
  };

  const handleStartReading = async () => {
    setIsUpdatingStatus(true);
    const result = await updateBookStatus(userBook.id, "reading");
    setIsUpdatingStatus(false);
  };

  const handleUpdateNotes = async () => {
    const result = await updateBookNotes(userBook.id, notesValue);
    if (result.success) {
      setShowNotesDialog(false);
    }
  };

  if (userBook.status === "reading") {
    return (
      <>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => setShowProgressDialog(true)}
            className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Update Progress
          </button>
          <button
            onClick={() => setShowNotesDialog(true)}
            className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
          >
            Add Notes
          </button>
          <button
            onClick={handleMarkFinished}
            disabled={isUpdatingStatus}
            className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {isUpdatingStatus ? "..." : "Mark Finished"}
          </button>
        </div>

        {/* Progress Dialog */}
        {showProgressDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background rounded-lg p-6 w-80">
              <h3 className="font-semibold mb-4">Update Reading Progress</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Current Page
                  </label>
                  <input
                    type="number"
                    value={progressValue}
                    onChange={(e) => setProgressValue(e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
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
                  <button
                    onClick={handleUpdateProgress}
                    disabled={isUpdatingProgress}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                  >
                    {isUpdatingProgress ? "Updating..." : "Update"}
                  </button>
                  <button
                    onClick={() => setShowProgressDialog(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notes Dialog */}
        {showNotesDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background rounded-lg p-6 w-96">
              <h3 className="font-semibold mb-4">Add Notes</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Notes
                  </label>
                  <textarea
                    value={notesValue}
                    onChange={(e) => setNotesValue(e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary h-32 resize-none"
                    placeholder="Add your thoughts about this book..."
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleUpdateNotes}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Save Notes
                  </button>
                  <button
                    onClick={() => setShowNotesDialog(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  if (userBook.status === "want_to_read") {
    return (
      <button
        onClick={handleStartReading}
        disabled={isUpdatingStatus}
        className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {isUpdatingStatus ? "Starting..." : "Start Reading"}
      </button>
    );
  }

  return null;
}
