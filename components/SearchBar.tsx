import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverAnchor } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import debounce from "lodash/debounce";
import { Search, ChevronDown, Book, User, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import React from "react";
import { gql, useLazyQuery } from "@apollo/client";
import { SearchResults, BookHit } from "@/components/SearchResults";

const SEARCH_BOOKS_ONLY = gql`
  query SearchBooksOnly($query: String!) {
    books: search(query: $query, query_type: "Title", per_page: 5, page: 1) {
      results
    }
  }
`;

const SEARCH_AUTHORS_ONLY = gql`
  query SearchAuthorsOnly($query: String!) {
    authors: search(query: $query, query_type: "Author", per_page: 5, page: 1) {
      results
    }
  }
`;

const SEARCH_BOTH = gql`
  query SearchBoth($query: String!) {
    books: search(query: $query, query_type: "Title", per_page: 3, page: 1) {
      results
    }
    authors: search(query: $query, query_type: "Author", per_page: 3, page: 1) {
      results
    }
  }
`;

// The results property contains an array of hits
interface SearchResultsData {
  hits: BookHit[];
}

// Response structures for different search modes
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

export type SearchMode = 'books' | 'authors' | 'both';

const searchModeConfig = {
  books: { label: 'Books', icon: Book, placeholder: 'Search books...' },
  authors: { label: 'Authors', icon: User, placeholder: 'Search authors...' },
  both: { label: 'Both', icon: Users, placeholder: 'Search books and authors...' }
};

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BookHit[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchMode, setSearchMode] = useState<SearchMode>('books');

  const router = useRouter();

  const [searchBooksOnly, { loading: isLoadingBooks }] = useLazyQuery<SearchBooksResponse>(
    SEARCH_BOOKS_ONLY,
    {
      fetchPolicy: "network-only",
      onCompleted: (data) => {
        console.log("Books search completed:", data);
        setHasSearched(true);
        if (data?.books?.results?.hits) {
          const bookHits = data.books.results.hits.map(hit => ({ ...hit, type: 'book' as const }));
          setResults(bookHits);
        }
      },
    }
  );

  const [searchAuthorsOnly, { loading: isLoadingAuthors }] = useLazyQuery<SearchAuthorsResponse>(
    SEARCH_AUTHORS_ONLY,
    {
      fetchPolicy: "network-only",
      onCompleted: (data) => {
        console.log("Authors search completed:", data);
        setHasSearched(true);
        if (data?.authors?.results?.hits) {
          const authorHits = data.authors.results.hits.map(hit => ({ ...hit, type: 'author' as const }));
          setResults(authorHits);
        }
      },
    }
  );

  const [searchBoth, { loading: isLoadingBoth }] = useLazyQuery<SearchBothResponse>(
    SEARCH_BOTH,
    {
      fetchPolicy: "network-only",
      onCompleted: (data) => {
        console.log("Both search completed:", data);
        setHasSearched(true);
        if (data) {
          // Get both sets of results
          const bookHits = data.books?.results?.hits || [];
          const authorHits = data.authors?.results?.hits || [];
          
          // Combine and sort by relevance score
          const allResults = [
            ...authorHits.map(hit => ({ ...hit, type: 'author' as const })),
            ...bookHits.map(hit => ({ ...hit, type: 'book' as const }))
          ];
          
          // Sort by text_match score (higher is better)
          allResults.sort((a, b) => {
            const scoreA = a.text_match || 0;
            const scoreB = b.text_match || 0;
            return scoreB - scoreA;
          });
          
          // Take top 6 most relevant results
          const topResults = allResults.slice(0, 6);
          setResults(topResults);
        }
      },
    }
  );

  const isLoading = isLoadingBooks || isLoadingAuthors || isLoadingBoth;

  // Memoize the debounced search function
  const debouncedSearch = useMemo(
    () =>
      debounce((searchQuery: string, mode: SearchMode) => {
        if (!searchQuery.trim()) {
          setResults([]);
          setHasSearched(false);
          return;
        }
        
        switch (mode) {
          case 'books':
            searchBooksOnly({ variables: { query: searchQuery } });
            break;
          case 'authors':
            searchAuthorsOnly({ variables: { query: searchQuery } });
            break;
          case 'both':
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
      setShowResults(false);
    }

    return () => {
      debouncedSearch.cancel();
    };
  }, [query, searchMode, debouncedSearch]);

  const handleBookSelect = (bookId: string) => {
    router.push(`/books/${bookId}`);
    setShowResults(false);
  };

  return (
    <>
      {/* Mobile: Search Trigger Button (visible only on mobile) */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => router.push("/search")}
        className="h-10 w-10 md:hidden"
        aria-label="Search books"
      >
        <Search className="h-6 w-6 scale-110" />
      </Button>

      {/* Desktop: Traditional search input (visible only on desktop) */}
      <Popover open={showResults} onOpenChange={setShowResults}>
        <PopoverAnchor asChild>
          <div className="relative w-full hidden md:block">
            <div className="flex">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="rounded-r-none border-r-0 px-3 shrink-0"
                  >
                    {React.createElement(searchModeConfig[searchMode].icon, { className: "h-4 w-4 mr-1" })}
                    {searchModeConfig[searchMode].label}
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {(Object.keys(searchModeConfig) as SearchMode[]).map((mode) => (
                    <DropdownMenuItem
                      key={mode}
                      onClick={() => setSearchMode(mode)}
                      className="cursor-pointer"
                    >
                      {React.createElement(searchModeConfig[mode].icon, { className: "h-4 w-4 mr-2" })}
                      {searchModeConfig[mode].label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Input
                type="text"
                placeholder={searchModeConfig[searchMode].placeholder}
                value={query}
                onChange={(e) => {
                  const newQuery = e.target.value;
                  setQuery(newQuery);
                  if (newQuery.trim()) {
                    setShowResults(true);
                  }
                }}
                onFocus={() => {
                  if (query || results.length > 0) {
                    setShowResults(true);
                  }
                }}
                className="rounded-l-none flex-1 pr-10"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </PopoverAnchor>
        <PopoverContent 
          className="w-[var(--radix-popover-trigger-width)] max-h-[400px] overflow-y-auto p-2" 
          align="start"
          sideOffset={8}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {(results.length > 0 || isLoading || (query && hasSearched)) && (
            <SearchResults
              results={results}
              query={query}
              isLoading={isLoading}
              hasSearched={hasSearched}
              onBookSelect={handleBookSelect}
            />
          )}
        </PopoverContent>
      </Popover>
    </>
  );
}

export default SearchBar;
