import { type UserBook } from "@/utils/supabase";
import { Book } from "@/types/book";
import { Card } from "@/components/ui/card";
import { BookActions } from "./BookActions";
import {
  Clock,
  Star,
} from "lucide-react";

import Image from "next/image";
import Link from "next/link";

interface BookListItemProps {
  userBook: UserBook;
  book: Book;
  rating?: number;
}

export function BookListItem({ userBook, book, rating }: BookListItemProps) {
  const progressPercentage =
    book.pageCount && userBook.current_page
      ? Math.min(100, (userBook.current_page / book.pageCount) * 100)
      : 0;
  return (
    <Link href={`/books/${book.id}`} className="block">
      <Card className="border p-4 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex gap-4 items-start">
          <div className="flex-shrink-0">
            <div className="relative w-24 h-32 rounded overflow-hidden">
              <Image
                fill
                src={book.coverUrl || "/book-placeholder.png"}
                alt={book.title}
              />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h3 className="font-medium text-lg line-clamp-1 sm:text-xl">
                {book.title}
              </h3>
            </div>

            <p className="text-muted-foreground text-sm mb-2 sm:text-base">
              {book.author}
            </p>

            <div className="space-y-3">
              {/* Enhanced Progress for currently reading books */}
              {userBook.status === "reading" && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 font-medium">
                      Reading Progress
                    </span>
                    <span className="text-blue-600 font-semibold">
                      {progressPercentage.toFixed(0)}%
                    </span>
                  </div>
                  <div className="relative">
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-400 to-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out relative"
                        style={{ width: `${progressPercentage}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20 animate-pulse" />
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {userBook.current_page || 0} of {book.pageCount || "?"}{" "}
                    pages
                  </div>
                </div>
              )}

              {/* Enhanced Rating for finished books */}
              {userBook.status === "finished" && rating && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-50 rounded-lg">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-semibold text-gray-700">
                    {rating}/10
                  </span>
                </div>
              )}

              {/* Notes with better styling */}
              {userBook.notes && (
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <div className="text-xs font-medium text-gray-500 mb-1">
                    Notes
                  </div>
                  <div className="text-sm text-gray-700 line-clamp-2">
                    {userBook.notes}
                  </div>
                </div>
              )}

              {/* Enhanced timestamp */}
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Clock className="w-3 h-3" />
                <span>
                  Updated {new Date(userBook.updated_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          <div className="flex-shrink-0">
            <BookActions userBook={userBook} bookPageCount={book.pageCount} />
          </div>
        </div>
      </Card>
    </Link>
  );
}
