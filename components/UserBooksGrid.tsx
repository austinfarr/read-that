import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface UserBook {
  id: string;
  status: string;
  start_date: string | null;
  finish_date: string | null;
  current_page: number | null;
  is_favorite: boolean;
  hardcover_id?: string;
  books: {
    id: string;
    title: string;
    author: string;
    coverUrl: string | null;
    pageCount: number | null;
  } | null;
}

interface UserBooksGridProps {
  books: UserBook[];
}

export default function UserBooksGrid({ books }: UserBooksGridProps) {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      reading: { label: "Currently Reading", variant: "default" as const },
      finished: { label: "Finished", variant: "secondary" as const },
      want_to_read: { label: "Want to Read", variant: "outline" as const },
      dnf: { label: "Did Not Finish", variant: "destructive" as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {books.map((userBook) => {
        const bookLink = userBook.books?.id ? `/books/${userBook.books.id}` : `#`;
        const bookTitle = userBook.books?.title || `Book ID: ${userBook.hardcover_id || userBook.id}`;
        const bookAuthor = userBook.books?.author || "Author unknown";
        const coverUrl = userBook.books?.coverUrl;
        const pageCount = userBook.books?.pageCount;

        return (
          <Link key={userBook.id} href={bookLink}>
            <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
              <div className="aspect-[2/3] relative bg-muted">
                {coverUrl ? (
                  <Image
                    src={coverUrl}
                    alt={bookTitle}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full p-4">
                    <p className="text-sm text-muted-foreground text-center">
                      {bookTitle}
                    </p>
                  </div>
                )}
                {userBook.is_favorite && (
                  <div className="absolute top-2 right-2">
                    <span className="text-2xl">⭐</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-medium line-clamp-2 text-sm mb-1">
                  {bookTitle}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                  {bookAuthor}
                </p>
                
                <div className="space-y-2">
                  {getStatusBadge(userBook.status)}
                  
                  {userBook.status === 'reading' && userBook.current_page && pageCount && (
                    <div className="text-xs text-muted-foreground">
                      Page {userBook.current_page} of {pageCount}
                      <div className="w-full bg-secondary rounded-full h-1.5 mt-1">
                        <div 
                          className="bg-primary h-1.5 rounded-full"
                          style={{ width: `${(userBook.current_page / pageCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {userBook.finish_date && (
                    <p className="text-xs text-muted-foreground">
                      Finished {format(new Date(userBook.finish_date), 'MMM d, yyyy')}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}