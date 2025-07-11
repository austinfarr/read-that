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

// Represents the structure of an author document from Hardcover's API
interface AuthorDocument {
  id: string;
  name: string;
  books?: string[];
  books_count?: number;
  image?: {
    url: string;
  };
}

// Each search result is a hit with a document property (can be book or author)
export interface BookHit {
  document: BookDocument | AuthorDocument;
  text_match?: number;
  type?: 'author' | 'book';
}

interface SearchResultsProps {
  results: BookHit[];
  query: string;
  isLoading: boolean;
  hasSearched: boolean;
  onBookSelect: (bookId: string) => void;
}

// Type guard to check if a document is an author
function isAuthorDocument(document: BookDocument | AuthorDocument): document is AuthorDocument {
  return 'books_count' in document || 'books' in document;
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
        {results.map((result) => {
          const doc = result.document;
          const isAuthor = result.type === 'author' || isAuthorDocument(doc);
          
          return (
            <div
              key={doc.id}
              className="flex items-center gap-3 p-1 hover:bg-accent rounded-lg cursor-pointer transition-colors"
              onClick={() => {
                if (isAuthor) {
                  // Navigate to author page
                  window.location.href = `/authors/${doc.id}`;
                } else {
                  // Navigate to book page
                  onBookSelect(doc.id);
                }
              }}
            >
              {doc.image?.url ? (
                <Image
                  src={doc.image.url}
                  alt={isAuthor ? doc.name : (doc as BookDocument).title}
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
                {isAuthor ? (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded">
                        Author
                      </span>
                    </div>
                    <p className="font-medium text-sm line-clamp-2 mt-1">
                      {doc.name}
                    </p>
                    {doc.books_count && (
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                        {doc.books_count} {doc.books_count === 1 ? 'book' : 'books'}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <p className="font-medium text-sm line-clamp-2">
                      {(doc as BookDocument).title}
                    </p>
                    {(doc as BookDocument).author_names && (
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                        {(doc as BookDocument).author_names.join(", ")}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
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
