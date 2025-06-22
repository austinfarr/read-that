import { Star, Clock, CheckCircle, XCircle, Heart } from "lucide-react";
import { type UserBook } from "@/utils/supabase";
import BookCard from "@/components/BookCard";
import { Book } from "@/types/book";

interface LibraryBookItemProps {
  book: Book;
  userBook: UserBook;
  rating?: number;
}

export function LibraryBookItem({ book, userBook, rating }: LibraryBookItemProps) {
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

  return (
    <div className="flex flex-col items-center space-y-4">
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
          {rating && (
            <div className="absolute bottom-2 left-2 bg-slate-900/90 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1.5 text-xs border border-slate-700/50">
              <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
              <span className="text-slate-200 font-medium">
                {rating}/10
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Book info and notes below the card */}
      <div className="w-full max-w-[180px] space-y-2">
        {/* Book title and author for always visible info */}
        <div className="text-center">
          <h3 className="font-medium text-sm line-clamp-1">{book.title}</h3>
          <p className="text-xs text-muted-foreground line-clamp-1">
            {book.author}
          </p>
        </div>
      </div>
    </div>
  );
}