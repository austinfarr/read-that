import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverAnchor } from "@/components/ui/popover";
import debounce from "lodash/debounce";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { gql, useLazyQuery } from "@apollo/client";
import { SearchResults, BookHit } from "@/components/SearchResults";

const SEARCH_BOOKS = gql`
  query SearchBooks($query: String!) {
    books: search(query: $query, query_type: "Title", per_page: 5, page: 1) {
      results
    }
    authors: search(query: $query, query_type: "Author", per_page: 5, page: 1) {
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
  books: {
    results: SearchResultsData;
  };
  authors: {
    results: SearchResultsData;
  };
}

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BookHit[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const router = useRouter();

  const [searchBooks, { loading: isLoading }] = useLazyQuery<SearchResponse>(
    SEARCH_BOOKS,
    {
      fetchPolicy: "network-only",
      onCompleted: (data) => {
        console.log("Search completed:", data);
        setHasSearched(true);
        if (data) {
          // Get both sets of results
          const bookHits = data.books?.results?.hits || [];
          const authorHits = data.authors?.results?.hits || [];
          
          // Combine and sort by relevance score
          const allResults = [
            ...authorHits.map(hit => ({ ...hit, type: 'author' })),
            ...bookHits.map(hit => ({ ...hit, type: 'book' }))
          ];
          
          // Sort by text_match score (higher is better)
          allResults.sort((a, b) => {
            const scoreA = a.text_match || 0;
            const scoreB = b.text_match || 0;
            return scoreB - scoreA;
          });
          
          // Take top 5 most relevant results
          const topResults = allResults.slice(0, 5);
          setResults(topResults);
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
          setHasSearched(false);
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
      setHasSearched(false);
      setShowResults(false);
    }

    return () => {
      debouncedSearch.cancel();
    };
  }, [query, debouncedSearch]);

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
            <Input
              type="text"
              placeholder="Search books..."
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
              className="w-full pr-10"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
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
