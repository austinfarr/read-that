import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import debounce from "lodash/debounce";
import { Search } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface BookResult {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    imageLinks?: {
      thumbnail: string;
    };
  };
}

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BookResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const router = useRouter();

  // Debounced search function
  const debouncedSearch = debounce(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
          searchQuery
        )}&maxResults=5`
      );
      const data = await response.json();
      setResults(data.items || []);
    } catch (error) {
      console.error("Error fetching books:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, 300);

  useEffect(() => {
    if (query) {
      debouncedSearch(query);
    } else {
      setResults([]);
    }

    return () => {
      debouncedSearch.cancel();
    };
  }, [query]);

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
                    key={book.id}
                    className="flex items-center gap-3 p-2 hover:bg-accent rounded-md cursor-pointer"
                    onClick={() => {
                      router.push(`/books/${book.id}`);
                      setShowResults(false);
                      setQuery("");
                    }}
                  >
                    {book.volumeInfo.imageLinks?.thumbnail ? (
                      <Image
                        src={book.volumeInfo.imageLinks.thumbnail}
                        alt={book.volumeInfo.title}
                        width={50}
                        height={75}
                        className="object-cover rounded"
                      />
                    ) : (
                      <div className="w-10 h-[60px] bg-muted rounded flex items-center justify-center">
                        <Search className="h-4 w-4" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {book.volumeInfo.title}
                      </p>
                      {book.volumeInfo.authors && (
                        <p className="text-xs text-muted-foreground truncate">
                          {book.volumeInfo.authors.join(", ")}
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
