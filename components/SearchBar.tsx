import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import debounce from "lodash/debounce";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { gql, useLazyQuery } from "@apollo/client";
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
        onClick={() => router.push('/search')}
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

    </>
  );
}

export default SearchBar;
