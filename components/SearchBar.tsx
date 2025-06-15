import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import debounce from "lodash/debounce";
import { Search, X, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo, useRef } from "react";
import { gql, useLazyQuery } from "@apollo/client";
import { cn } from "@/lib/utils";
import { SearchResults, BookHit } from "@/components/SearchResults";

const SEARCH_BOOKS = gql`
  query SearchBooks($query: String!) {
    search(query: $query, query_type: "Title", per_page: 5, page: 1) {
      results
    }
  }
`;

// The results property contains an array of hits
interface SearchResultsData {
  hits: BookHit[];
}

// Complete response structure from the GraphQL query
interface SearchResponse {
  search: {
    results: SearchResultsData;
  };
}

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BookHit[]>([]);
  const [showResults, setShowResults] = useState(false);
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


  return (
    <>
      {/* Mobile: Search Trigger Button (visible only on mobile) */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsSearchOpen(true)}
        className="h-10 w-10 md:hidden"
        aria-label="Search books"
      >
        <Search className="h-6 w-6 scale-110" />
      </Button>

      {/* Desktop: Traditional search input (visible only on desktop) */}
      <div className="relative w-full max-w-sm lg:max-w-md hidden md:block">
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
              <SearchResults
                results={results}
                query={query}
                isLoading={isLoading}
                onBookSelect={handleBookSelect}
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Mobile Search Overlay (always rendered but conditionally visible) */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm transition-all duration-300 md:hidden",
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
                <SearchResults
                  results={results}
                  query={query}
                  isLoading={isLoading}
                  onBookSelect={handleBookSelect}
                />
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

export default SearchBar;
