import { BookOpen } from "lucide-react";
import Image from "next/image";

// Represents the structure of a book document from Hardcover's API
interface BookDocument {
  id: string;
  title: string;
  author_names?: string[];
  image?: {
    url: string;
  };
}

// Each search result is a hit with a document property
export interface BookHit {
  document: BookDocument;
}

interface SearchResultsProps {
  results: BookHit[];
  query: string;
  isLoading: boolean;
  hasSearched: boolean;
  onBookSelect: (bookId: string) => void;
}

export function SearchResults({
  results,
  query,
  isLoading,
  hasSearched,
  onBookSelect,
}: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (results.length > 0) {
    return (
      <div className="space-y-1">
        {results.map((book) => (
          <div
            key={book.document.id}
            className="flex items-center gap-3 p-1 hover:bg-accent rounded-lg cursor-pointer transition-colors"
            onClick={() => onBookSelect(book.document.id)}
          >
            {book.document.image?.url ? (
              <Image
                src={book.document.image.url}
                alt={book.document.title}
                width={50}
                height={75}
                className="object-cover rounded flex-shrink-0"
              />
            ) : (
              <div className="h-[75px] w-[50px] bg-muted rounded flex-shrink-0 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-muted-foreground" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm line-clamp-2">
                {book.document.title}
              </p>
              {book.document.author_names && (
                <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                  {book.document.author_names.join(", ")}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (hasSearched && !isLoading && results.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        No books found for "{query}"
      </div>
    );
  }

  return null;
}
