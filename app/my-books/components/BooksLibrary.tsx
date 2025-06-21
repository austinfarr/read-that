"use client";

import { useState } from "react";
import { type UserBook } from "@/utils/supabase";
import { Book } from "@/types/book";
import { BookActions } from "./BookActions";
import { Card } from "@/components/ui/card";

interface BooksLibraryProps {
  userBooks: UserBook[];
  booksData: Record<string, Book>;
}

type FilterType = "all" | "reading" | "want_to_read" | "finished" | "favorites";

export function BooksLibrary({ userBooks, booksData }: BooksLibraryProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const convertToBookType = (userBook: UserBook): Book => {
    // Try to get book data from Hardcover API response
    if (userBook.hardcover_id && booksData[userBook.hardcover_id]) {
      return booksData[userBook.hardcover_id];
    }

    // Fallback if no book data
    return {
      id: userBook.id,
      title: "Unknown Book",
      author: "Unknown Author",
      coverUrl: "",
      description: null,
      pageCount: null,
      publicationYear: null,
    };
  };

  const getStatusLabel = (status: UserBook["status"]) => {
    switch (status) {
      case "want_to_read":
        return "Want to Read";
      case "reading":
        return "Currently Reading";
      case "finished":
        return "Finished";
      case "dnf":
        return "Did Not Finish";
      default:
        return status;
    }
  };

  const getStatusStyle = (status: UserBook["status"]) => {
    switch (status) {
      case "reading":
        return "bg-blue-100 text-blue-700";
      case "finished":
        return "bg-green-100 text-green-700";
      case "want_to_read":
        return "bg-amber-100 text-amber-700";
      case "dnf":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Sort all books by most recent activity
  const sortedBooks = [...userBooks].sort((a, b) => {
    const aDate = new Date(a.updated_at).getTime();
    const bDate = new Date(b.updated_at).getTime();
    return bDate - aDate;
  });

  // Filter books based on active filter
  const filteredBooks = sortedBooks.filter((book) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "favorites") return book.is_favorite;
    return book.status === activeFilter;
  });

  // Get filter counts
  const filterCounts = {
    all: userBooks.length,
    reading: userBooks.filter((ub) => ub.status === "reading").length,
    want_to_read: userBooks.filter((ub) => ub.status === "want_to_read").length,
    finished: userBooks.filter((ub) => ub.status === "finished").length,
    favorites: userBooks.filter((ub) => ub.is_favorite).length,
  };

  return (
    <div className="space-y-8">
      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveFilter("all")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeFilter === "all"
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80"
          }`}
        >
          All ({filterCounts.all})
        </button>
        <button
          onClick={() => setActiveFilter("reading")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeFilter === "reading"
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80"
          }`}
        >
          Reading ({filterCounts.reading})
        </button>
        <button
          onClick={() => setActiveFilter("want_to_read")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeFilter === "want_to_read"
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80"
          }`}
        >
          Want to Read ({filterCounts.want_to_read})
        </button>
        <button
          onClick={() => setActiveFilter("finished")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeFilter === "finished"
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80"
          }`}
        >
          Finished ({filterCounts.finished})
        </button>
        <button
          onClick={() => setActiveFilter("favorites")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeFilter === "favorites"
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80"
          }`}
        >
          ❤️ Favorites ({filterCounts.favorites})
        </button>
      </div>

      {/* Books Activity Feed */}
      <div className="space-y-4">
        {filteredBooks.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No books found for the selected filter</p>
          </div>
        ) : (
          filteredBooks.map((userBook) => {
            const book = convertToBookType(userBook);
            return (
              <Card key={userBook.id} className=" border p-4">
                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0">
                    <img
                      src={book.coverUrl || "/book-placeholder.png"}
                      alt={book.title}
                      className="w-16 h-24 object-cover rounded sm:w-20 sm:h-28"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-medium text-lg line-clamp-1 sm:text-xl">
                        {book.title}
                      </h3>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getStatusStyle(
                          userBook.status
                        )}`}
                      >
                        {getStatusLabel(userBook.status)}
                      </span>
                      {userBook.is_favorite && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                          ❤️
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm mb-2 sm:text-base">
                      {book.author}
                    </p>

                    <div className="space-y-2">
                      {/* Progress for currently reading books */}
                      {userBook.status === "reading" && (
                        <>
                          <div className="text-sm text-muted-foreground">
                            Progress: {userBook.current_page || 0} /{" "}
                            {book.pageCount || "Unknown"} pages
                          </div>
                          {book.pageCount && userBook.current_page && (
                            <div className="w-full bg-muted rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full transition-all"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    (userBook.current_page / book.pageCount) *
                                      100
                                  )}%`,
                                }}
                              />
                            </div>
                          )}
                        </>
                      )}

                      {/* Rating for finished books */}
                      {userBook.status === "finished" && userBook.rating && (
                        <div className="text-sm text-muted-foreground">
                          ⭐ Rating: {userBook.rating}/10
                        </div>
                      )}

                      {/* Notes */}
                      {userBook.notes && (
                        <div className="text-sm text-muted-foreground line-clamp-2">
                          Notes: {userBook.notes}
                        </div>
                      )}

                      {/* Activity timestamp */}
                      <div className="text-xs text-muted-foreground">
                        Last updated:{" "}
                        {new Date(userBook.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <BookActions
                      userBook={userBook}
                      bookPageCount={book.pageCount}
                    />
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
