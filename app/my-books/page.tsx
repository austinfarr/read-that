"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  Heart,
} from "lucide-react";
import { supabase, SAMPLE_USER_ID, type UserBook } from "@/utils/supabase";
import { getBooksByIds, hardcoverToBook } from "@/utils/hardcover";
import BookCard from "@/components/BookCard";
import { Book } from "@/types/book";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MyBooksPage() {
  const [userBooks, setUserBooks] = useState<UserBook[]>([]);
  const [booksData, setBooksData] = useState<Record<string, Book>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchUserBooks();
  }, []);

  const fetchUserBooks = async () => {
    try {
      // First, fetch user books from Supabase
      const { data, error } = await supabase
        .from("user_books")
        .select("*")
        .eq("user_id", SAMPLE_USER_ID)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      const userBooksData = data || [];
      setUserBooks(userBooksData);

      // Extract unique hardcover IDs
      const hardcoverIds = userBooksData
        .filter((ub) => ub.hardcover_id)
        .map((ub) => ub.hardcover_id as string);

      if (hardcoverIds.length > 0) {
        // Fetch book details from Hardcover API
        const books = await getBooksByIds(hardcoverIds);

        // Convert to a map for easy lookup
        const booksMap: Record<string, Book> = {};
        books.forEach((book) => {
          booksMap[book.id.toString()] = hardcoverToBook(book);
        });

        setBooksData(booksMap);
      }
    } catch (error) {
      console.error("Error fetching user books:", error);
    } finally {
      setLoading(false);
    }
  };

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "reading":
        return <Clock className="w-4 h-4" />;
      case "finished":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "dnf":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
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

  return (
    <div className="min-h-screen pt-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <BookOpen className="w-8 h-8 text-primary" />
          <h1 className="text-4xl font-bold">My Books</h1>
        </div>

        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-pulse text-muted-foreground">
              Loading your books...
            </div>
          </div>
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All ({tabCounts.all})</TabsTrigger>
              <TabsTrigger value="reading">
                Reading ({tabCounts.reading})
              </TabsTrigger>
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
              {filterBooksByStatus(
                activeTab === "favorites" ? "favorites" : activeTab
              ).length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    {activeTab === "favorites"
                      ? "You haven't marked any books as favorites yet"
                      : `No books in "${getStatusLabel(activeTab)}" list`}
                  </p>
                </div>
              ) : (
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filterBooksByStatus(
                    activeTab === "favorites" ? "favorites" : activeTab
                  ).map((userBook) => {
                    const book = convertToBookType(userBook);
                    return (
                      <div
                        key={userBook.id}
                        className="flex flex-col items-center space-y-4"
                      >
                        {/* Book card with custom wrapper to control hover area */}
                        <div className="relative flex justify-center">
                          <BookCard book={book} href={`/books/${book.id}`} />

                          {/* Overlay badges on the card */}
                          <div className="absolute inset-0 pointer-events-none">
                            {/* Status badge */}
                            <div className="absolute top-2 right-2 bg-slate-900/90 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1.5 text-xs border border-slate-700/50">
                              {getStatusIcon(userBook.status)}
                              <span className="text-slate-200">
                                {getStatusLabel(userBook.status)}
                              </span>
                            </div>

                            {/* Favorite indicator */}
                            {userBook.is_favorite && (
                              <div className="absolute top-2 left-2">
                                <div className="w-7 h-7 bg-slate-900/90 backdrop-blur-sm rounded-full flex items-center justify-center border border-slate-700/50">
                                  <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                                </div>
                              </div>
                            )}

                            {/* Rating */}
                            {userBook.rating && (
                              <div className="absolute bottom-2 left-2 bg-slate-900/90 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1.5 text-xs border border-slate-700/50">
                                <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                                <span className="text-slate-200 font-medium">
                                  {userBook.rating}/10
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Book info and notes below the card */}
                        <div className="w-full max-w-[180px] space-y-2">
                          {/* Book title and author for always visible info */}
                          <div className="text-center">
                            <h3 className="font-medium text-sm line-clamp-1">
                              {book.title}
                            </h3>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {book.author}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
