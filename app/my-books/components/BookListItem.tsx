import { type UserBook } from "@/utils/supabase";
import { Book } from "@/types/book";
import { Card } from "@/components/ui/card";
import { BookActions } from "./BookActions";
import { getStatusLabel, getStatusStyle } from "../utils/bookUtils";
import {
  ChevronRight,
  Clock,
  CheckCircle2,
  BookOpen,
  Bookmark,
  Star,
} from "lucide-react";

import Image from "next/image";
import Link from "next/link";

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

interface BookListItemProps {
  userBook: UserBook;
  book: Book;
  rating?: number;
}

export function BookListItem({ userBook, book, rating }: BookListItemProps) {
  const statusConfig = getStatusConfig(userBook.status);
  const StatusIcon = statusConfig.icon;
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
              {userBook.status === "finished" && rating && (
                <div className="text-sm text-muted-foreground">
                  ⭐ Rating: {rating}/10
                </div>
              )}

              {/* Notes */}
              {userBook.notes && (
                <div className="text-sm text-muted-foreground line-clamp-2">
                  Notes: {userBook.notes}
                </div>
              )}

              <div
                className={`
                inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                ${statusConfig.className}
              `}
              >
                <StatusIcon className="w-3.5 h-3.5" />
                <span>{statusConfig.label}</span>
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
