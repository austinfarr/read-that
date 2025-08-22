"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import debounce from "lodash/debounce";
import { Search, X, Book, User, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo, useRef } from "react";
import React from "react";
import { gql, useLazyQuery } from "@apollo/client";
import { SearchResults, BookHit } from "@/components/SearchResults";
import { SearchMode } from "@/components/SearchBar";

const SEARCH_BOOKS_ONLY = gql`
  query SearchBooksOnly($query: String!) {
    books: search(query: $query, query_type: "Title", per_page: 10, page: 1) {
      results
    }
  }
`;

const SEARCH_AUTHORS_ONLY = gql`
  query SearchAuthorsOnly($query: String!) {
    authors: search(
      query: $query
      query_type: "Author"
      per_page: 10
      page: 1
    ) {
      results
    }
  }
`;

const SEARCH_BOTH = gql`
  query SearchBoth($query: String!) {
    books: search(query: $query, query_type: "Title", per_page: 6, page: 1) {
      results
    }
    authors: search(query: $query, query_type: "Author", per_page: 6, page: 1) {
      results
    }
  }
`;

interface SearchResultsData {
  hits: BookHit[];
}

interface SearchBooksResponse {
  books: {
    results: SearchResultsData;
  };
}

interface SearchAuthorsResponse {
  authors: {
    results: SearchResultsData;
  };
}

interface SearchBothResponse {
  books: {
    results: SearchResultsData;
  };
  authors: {
    results: SearchResultsData;
  };
}

const searchModeConfig = {
  books: { label: "Books", icon: Book, placeholder: "Search books..." },
  authors: { label: "Authors", icon: User, placeholder: "Search authors..." },
  both: {
    label: "Both",
    icon: Users,
    placeholder: "Search books and authors...",
  },
};

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BookHit[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchMode, setSearchMode] = useState<SearchMode>("books");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const [searchBooksOnly, { loading: isLoadingBooks }] =
    useLazyQuery<SearchBooksResponse>(SEARCH_BOOKS_ONLY, {
      fetchPolicy: "network-only",
      onCompleted: (data) => {
        setHasSearched(true);
        if (data?.books?.results?.hits) {
          const bookHits = data.books.results.hits.map((hit) => ({
            ...hit,
            type: "book" as const,
          }));
          setResults(bookHits);
        }
      },
    });

  const [searchAuthorsOnly, { loading: isLoadingAuthors }] =
    useLazyQuery<SearchAuthorsResponse>(SEARCH_AUTHORS_ONLY, {
      fetchPolicy: "network-only",
      onCompleted: (data) => {
        setHasSearched(true);
        if (data?.authors?.results?.hits) {
          const authorHits = data.authors.results.hits.map((hit) => ({
            ...hit,
            type: "author" as const,
          }));
          setResults(authorHits);
        }
      },
    });

  const [searchBoth, { loading: isLoadingBoth }] =
    useLazyQuery<SearchBothResponse>(SEARCH_BOTH, {
      fetchPolicy: "network-only",
      onCompleted: (data) => {
        setHasSearched(true);
        if (data) {
          const bookHits = data.books?.results?.hits || [];
          const authorHits = data.authors?.results?.hits || [];

          const allResults = [
            ...authorHits.map((hit) => ({ ...hit, type: "author" as const })),
            ...bookHits.map((hit) => ({ ...hit, type: "book" as const })),
          ];

          allResults.sort((a, b) => {
            const scoreA = a.text_match || 0;
            const scoreB = b.text_match || 0;
            return scoreB - scoreA;
          });

          const topResults = allResults.slice(0, 12);
          setResults(topResults);
        }
      },
    });

  const isLoading = isLoadingBooks || isLoadingAuthors || isLoadingBoth;

  const debouncedSearch = useMemo(
    () =>
      debounce((searchQuery: string, mode: SearchMode) => {
        if (!searchQuery.trim()) {
          setResults([]);
          setHasSearched(false);
          return;
        }

        switch (mode) {
          case "books":
            searchBooksOnly({ variables: { query: searchQuery } });
            break;
          case "authors":
            searchAuthorsOnly({ variables: { query: searchQuery } });
            break;
          case "both":
            searchBoth({ variables: { query: searchQuery } });
            break;
        }
      }, 300),
    [searchBooksOnly, searchAuthorsOnly, searchBoth]
  );

  useEffect(() => {
    if (query) {
      debouncedSearch(query, searchMode);
    } else {
      setResults([]);
      setHasSearched(false);
    }

    return () => {
      debouncedSearch.cancel();
    };
  }, [query, searchMode, debouncedSearch]);

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
    setHasSearched(false);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">Search</h1>
          </div>
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

        <div className="pb-2">
          <Select
            value={searchMode}
            onValueChange={(value: SearchMode) => setSearchMode(value)}
          >
            <SelectTrigger className="w-[150px] h-8 px-4">
              <SelectValue>
                <div className="flex items-center">
                  {React.createElement(searchModeConfig[searchMode].icon, {
                    className: "h-3 w-3 mr-2",
                  })}

                  <p className="text-[16px]">
                    {searchModeConfig[searchMode].label}
                  </p>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(searchModeConfig) as SearchMode[]).map((mode) => (
                <SelectItem key={mode} value={mode}>
                  <div className="flex items-center">
                    {React.createElement(searchModeConfig[mode].icon, {
                      className: "h-4 w-4 mr-2",
                    })}
                    {searchModeConfig[mode].label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <form onSubmit={handleSearchSubmit} className="space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              type="text"
              placeholder={searchModeConfig[searchMode].placeholder}
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
                Search through thousands of books and authors to find your
                perfect match. Use the dropdown above to choose what to search
                for.
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
                hasSearched={hasSearched}
                onBookSelect={handleBookSelect}
              />
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
