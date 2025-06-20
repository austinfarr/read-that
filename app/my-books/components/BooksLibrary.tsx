"use client";

import { useState } from "react";
import { Clock, CheckCircle, XCircle, Heart } from "lucide-react";
import { type UserBook } from "@/utils/supabase";
import { Book } from "@/types/book";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LibraryBookItem } from "@/app/my-books/components/LibraryBookItem";

interface BooksLibraryProps {
  userBooks: UserBook[];
  booksData: Record<string, Book>;
}

export function BooksLibrary({ userBooks, booksData }: BooksLibraryProps) {
  const [activeTab, setActiveTab] = useState("all");

  const filterBooksByStatus = (status?: string) => {
    if (!status || status === "all") return userBooks;
    if (status === "favorites") return userBooks.filter((ub) => ub.is_favorite);
    return userBooks.filter((ub) => ub.status === status);
  };

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

  const getStatusLabel = (status: string) => {
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

  const tabCounts = {
    all: userBooks.length,
    reading: userBooks.filter((ub) => ub.status === "reading").length,
    want_to_read: userBooks.filter((ub) => ub.status === "want_to_read").length,
    finished: userBooks.filter((ub) => ub.status === "finished").length,
    favorites: userBooks.filter((ub) => ub.is_favorite).length,
  };

  const filteredBooks = filterBooksByStatus(
    activeTab === "favorites" ? "favorites" : activeTab
  );

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="all">All ({tabCounts.all})</TabsTrigger>
        <TabsTrigger value="reading">Reading ({tabCounts.reading})</TabsTrigger>
        <TabsTrigger value="want_to_read">
          Want to Read ({tabCounts.want_to_read})
        </TabsTrigger>
        <TabsTrigger value="finished">
          Finished ({tabCounts.finished})
        </TabsTrigger>
        <TabsTrigger value="favorites">
          <Heart className="w-4 h-4 mr-1" />({tabCounts.favorites})
        </TabsTrigger>
      </TabsList>

      <TabsContent value={activeTab} className="space-y-6">
        {filteredBooks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {activeTab === "favorites"
                ? "You haven't marked any books as favorites yet"
                : `No books in "${getStatusLabel(activeTab)}" list`}
            </p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredBooks.map((userBook) => {
              const book = convertToBookType(userBook);
              return (
                <LibraryBookItem
                  key={userBook.id}
                  book={book}
                  userBook={userBook}
                />
              );
            })}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}