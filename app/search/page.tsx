'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import debounce from "lodash/debounce";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo, useRef } from "react";
import { gql, useLazyQuery } from "@apollo/client";
import { SearchResults, BookHit } from "@/components/SearchResults";

const SEARCH_BOOKS = gql`
  query SearchBooks($query: String!) {
    search(query: $query, query_type: "Title", per_page: 10, page: 1) {
      results
    }
  }
`;

interface SearchResultsData {
  hits: BookHit[];
}

interface SearchResponse {
  search: {
    results: SearchResultsData;
  };
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BookHit[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const [searchBooks, { loading: isLoading }] = useLazyQuery<SearchResponse>(
    SEARCH_BOOKS,
    {
      fetchPolicy: "network-only",
      onCompleted: (data) => {
        if (data && data.search && data.search.results) {
          setResults(data.search.results.hits);
        }
      },
    }
  );

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

  // Auto-focus search input when page loads
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const handleBookSelect = (bookId: string) => {
    router.push(`/books/${bookId}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && results.length > 0) {
      handleBookSelect(results[0].document.id);
    }
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Search Books</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-10 w-10 shrink-0 hover:bg-muted/80"
            aria-label="Close search"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearchSubmit} className="space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Search for books, authors, or titles..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 pr-10 h-11 text-base bg-muted/30 border-0 focus:ring-2 focus:ring-primary/30 rounded-lg shadow-sm"
            />
            {query && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={clearSearch}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Empty State */}
          {!query && !isLoading && (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-primary/60" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Discover Your Next Read
              </h3>
              <p className="text-muted-foreground max-w-sm leading-relaxed">
                Search through thousands of books to find your perfect match. Try searching for a title, author, or genre.
              </p>
              <div className="flex flex-wrap gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuery("Harry Potter")}
                  className="text-xs"
                >
                  Harry Potter
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuery("Dune")}
                  className="text-xs"
                >
                  Dune
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuery("Stephen King")}
                  className="text-xs"
                >
                  Stephen King
                </Button>
              </div>
            </div>
          )}

          {/* Search Results */}
          {(query || isLoading) && (
            <div className="space-y-4">
              <SearchResults
                results={results}
                query={query}
                isLoading={isLoading}
                onBookSelect={handleBookSelect}
              />
            </div>
          )}

        </form>
      </div>
    </div>
  );
}