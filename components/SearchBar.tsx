import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import debounce from 'lodash/debounce';
import { Search } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { gql, useLazyQuery } from '@apollo/client';

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
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<BookHit[]>([]);
  const [showResults, setShowResults] = useState(false);

  const router = useRouter();

  const [searchBooks, { loading: isLoading }] = useLazyQuery<SearchResponse>(
    SEARCH_BOOKS,
    {
      fetchPolicy: 'network-only', // Don't cache results
      onCompleted: (data) => {
        console.log('Search completed:', data);
        if (data && data.search && data.search.results) {
          setResults(data.search.results.hits);
        }
      },
    }
  );

  // Memoize the debounced search function to prevent recreation on every render
  const debouncedSearch = useMemo(
    () => debounce((searchQuery: string) => {
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

  return (
    <div className="relative w-[800px] max-w-sm">
      <div className="relative flex w-full max-w-sm items-center">
        <Input
          type="text"
          placeholder="Search books..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          className="pr-8"
        />
        <Search className="absolute right-2 h-4 w-4 text-muted-foreground" />
      </div>

      {/* Results dropdown */}
      {showResults && (results.length > 0 || isLoading) && (
        <Card className="absolute mt-2 w-full z-50">
          <CardContent className="p-2">
            {isLoading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Loading...
              </div>
            ) : (
              <div className="space-y-2">
                {results.map((book) => (
                  <div
                    key={book.document.id}
                    className="flex items-center gap-3 p-2 hover:bg-accent rounded-md cursor-pointer"
                    onClick={() => {
                      router.push(`/books/${book.document.id}`);
                      setShowResults(false);
                      setQuery('');
                    }}
                  >
                    {/* <div className="w-10 h-[60px] bg-muted rounded flex items-center justify-center">
                      <Search className="h-4 w-4" />
                    </div> */}

                    {book.document.image?.url ? (
                      <Image
                        src={book.document.image.url}
                        alt={book.document.title}
                        width={50}
                        height={75}
                        className="object-cover rounded"
                      />
                    ) : (
                      <div className="h-[75px] w-[50px] bg-muted rounded flex items-center justify-center" />
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {book.document.title}
                      </p>
                      {book.document.author_names && (
                        <p className="text-xs text-muted-foreground truncate">
                          {book.document.author_names.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default SearchBar;
