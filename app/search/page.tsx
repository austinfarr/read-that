'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import debounce from "lodash/debounce";
import { Search, X, ArrowLeft } from "lucide-react";
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
      <div className="container max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-9 w-9 shrink-0"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Search Books</h1>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearchSubmit} className="space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="What book are you looking for?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-12 pr-12 h-14 text-lg bg-muted/50 border-2 focus:border-primary/50 rounded-xl"
            />
            {query && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={clearSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 w-10"
                aria-label="Clear search"
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* Search Results */}
          <div className="space-y-4">
            <SearchResults
              results={results}
              query={query}
              isLoading={isLoading}
              onBookSelect={handleBookSelect}
            />
          </div>

          {/* Quick Action Button */}
          {query && results.length > 0 && (
            <div className="sticky bottom-6 pt-4">
              <Button 
                type="submit" 
                size="lg"
                className="w-full h-12 text-base font-medium shadow-lg"
              >
                Open "{results[0].document.title}"
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}