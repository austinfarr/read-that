import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetTrigger 
} from '@/components/ui/sheet';
import debounce from 'lodash/debounce';
import { Search, BookOpen } from 'lucide-react';
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
  const [isMobile, setIsMobile] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const router = useRouter();

  const [searchBooks, { loading: isLoading }] = useLazyQuery<SearchResponse>(
    SEARCH_BOOKS,
    {
      fetchPolicy: 'network-only',
      onCompleted: (data) => {
        console.log('Search completed:', data);
        if (data && data.search && data.search.results) {
          setResults(data.search.results.hits);
        }
      },
    }
  );

  // Memoize the debounced search function
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

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleBookSelect = (bookId: string) => {
    router.push(`/books/${bookId}`);
    setQuery('');
    setResults([]);
    setShowResults(false);
    setIsSheetOpen(false);
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
                  {book.document.author_names.join(', ')}
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
    // Mobile: Sheet-based search
    return (
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="p-2">
            <Search className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="top" className="h-auto max-h-[90vh] overflow-hidden">
          <SheetHeader className="space-y-4">
            <SheetTitle>Search Books</SheetTitle>
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
                autoFocus
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </SheetHeader>
          
          <div className="mt-6 max-h-[60vh] overflow-y-auto">
            <SearchResults />
          </div>
        </SheetContent>
      </Sheet>
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
