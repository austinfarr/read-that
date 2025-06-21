import { type UserBook } from "@/utils/supabase";
import { Book } from "@/types/book";
import { Card } from "@/components/ui/card";
import { BookActions } from "./BookActions";
import { getStatusLabel, getStatusStyle } from "../utils/bookUtils";
import Image from "next/image";
import Link from "next/link";

interface BookListItemProps {
  userBook: UserBook;
  book: Book;
}

export function BookListItem({ userBook, book }: BookListItemProps) {
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
                          (userBook.current_page / book.pageCount) * 100
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
              Last updated: {new Date(userBook.updated_at).toLocaleDateString()}
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
