import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import debounce from "lodash/debounce";
import { Search, BookOpen, X, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo, useRef } from "react";
import { gql, useLazyQuery } from "@apollo/client";
import { cn } from "@/lib/utils";

const SEARCH_BOOKS = gql`
  query SearchBooks($query: String!) {
    search(query: $query, query_type: "Title", per_page: 5, page: 1) {
      results
    }
  }
`;

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
interface BookHit {
  document: BookDocument;
}

// The results property contains an array of hits
interface SearchResults {
  hits: BookHit[];
}

// Complete response structure from the GraphQL query
interface SearchResponse {
  search: {
    results: SearchResults;
  };
}

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BookHit[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();

  const [searchBooks, { loading: isLoading }] = useLazyQuery<SearchResponse>(
    SEARCH_BOOKS,
    {
      fetchPolicy: "network-only",
      onCompleted: (data) => {
        console.log("Search completed:", data);
        if (data && data.search && data.search.results) {
          setResults(data.search.results.hits);
        }
      },
    }
  );

  // Memoize the debounced search function
  const debouncedSearch = useMemo(
    () =>
      debounce((searchQuery: string) => {
        if (!searchQuery.trim()) {
          setResults([]);
          return;
        }
        searchBooks({ variables: { query: searchQuery } });
      }, 300),
    [searchBooks]
  );

  useEffect(() => {
    if (query) {
      debouncedSearch(query);
    } else {
      setResults([]);
    }

    return () => {
      debouncedSearch.cancel();
    };
  }, [query, debouncedSearch]);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Focus search input when mobile search opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Close search on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isSearchOpen) {
        closeSearch();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isSearchOpen]);

  const handleBookSelect = (bookId: string) => {
    router.push(`/books/${bookId}`);
    closeSearch();
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
    setQuery("");
    setResults([]);
    setShowResults(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && results.length > 0) {
      // Navigate to first result
      handleBookSelect(results[0].document.id);
    }
  };

  const SearchResults = () => (
    <div className="space-y-2">
      {isLoading ? (
        <div className="p-4 text-center text-sm text-muted-foreground">
          Loading...
        </div>
      ) : results.length > 0 ? (
        results.map((book) => (
          <div
            key={book.document.id}
            className="flex items-center gap-3 p-3 hover:bg-accent rounded-lg cursor-pointer transition-colors"
            onClick={() => handleBookSelect(book.document.id)}
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
        ))
      ) : query && !isLoading ? (
        <div className="p-4 text-center text-sm text-muted-foreground">
          No books found for "{query}"
        </div>
      ) : null}
    </div>
  );

  if (isMobile) {
    // Mobile: Enhanced overlay search
    return (
      <>
        {/* Search Trigger Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSearchOpen(true)}
          className="h-10 w-10"
          aria-label="Search books"
        >
          <Search className="h-6 w-6 scale-110" />
        </Button>

        {/* Search Overlay */}
        <div
          className={cn(
            "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm transition-all duration-300",
            isSearchOpen ? "opacity-100 visible" : "opacity-0 invisible"
          )}
          onClick={closeSearch}
        >
          <div
            className={cn(
              "absolute top-0 left-0 right-0 bg-background border-b shadow-lg transition-transform duration-300 ease-out",
              isSearchOpen ? "translate-y-0" : "-translate-y-full"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="container px-4 py-4">
              {/* Search Header */}
              <div className="flex items-center space-x-3 mb-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeSearch}
                  className="h-9 w-9 shrink-0"
                  aria-label="Close search"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-lg font-semibold">Search Books</h2>
              </div>

              {/* Search Form */}
              <form onSubmit={handleSearchSubmit} className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    ref={searchInputRef}
                    type="text"
                    placeholder="What book are you looking for?"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setShowResults(true);
                    }}
                    className="pl-10 pr-10 h-12 text-base"
                  />
                  {query && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuery("")}
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                      aria-label="Clear search"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Search Results */}
                <div className="max-h-[60vh] overflow-y-auto">
                  <SearchResults />
                </div>

                {/* Search Button */}
                {query && results.length > 0 && (
                  <Button type="submit" className="w-full h-12 text-base">
                    Open "{results[0].document.title}"
                  </Button>
                )}
              </form>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Desktop: Traditional dropdown search
  return (
    <div className="relative w-full max-w-sm lg:max-w-md">
      <div className="relative">
        <Input
          type="text"
          placeholder="Search books..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          className="w-full pr-10"
        />
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      </div>

      {/* Desktop Results dropdown */}
      {showResults && (results.length > 0 || isLoading || query) && (
        <Card className="absolute mt-2 w-full z-50 max-h-[400px] overflow-y-auto">
          <CardContent className="p-2">
            <SearchResults />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default SearchBar;
