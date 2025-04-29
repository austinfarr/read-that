// app/books/[id]/page.tsx
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { BookDescription } from "@/components/BookDescription";

async function getBookDetails(id: string) {
  const response = await fetch(
    `https://www.googleapis.com/books/v1/volumes/${id}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch book details");
  }

  return response.json();
}

export default async function BookPage({ params }: { params: { id: string } }) {
  const book = await getBookDetails(params.id);
  const volumeInfo = book.volumeInfo;

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Book cover */}
            <div className="relative w-[200px] h-[300px] shrink-0 mx-auto md:mx-0">
              {volumeInfo.imageLinks?.thumbnail ? (
                <Image
                  src={`${volumeInfo.imageLinks.thumbnail}&fife=w800`}
                  alt={volumeInfo.title}
                  fill
                  className="object-cover rounded-lg"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
                  No image available
                </div>
              )}
            </div>

            {/* Book details */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{volumeInfo.title}</h1>
              {volumeInfo.authors && (
                <p className="text-lg text-muted-foreground mb-4">
                  by {volumeInfo.authors.join(", ")}
                </p>
              )}

              {/* Book metadata */}
              <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                {volumeInfo.publisher && (
                  <div>
                    <span className="font-semibold">Publisher:</span>{" "}
                    {volumeInfo.publisher}
                  </div>
                )}
                {volumeInfo.publishedDate && (
                  <div>
                    <span className="font-semibold">Published:</span>{" "}
                    {volumeInfo.publishedDate}
                  </div>
                )}
                {volumeInfo.pageCount && (
                  <div>
                    <span className="font-semibold">Pages:</span>{" "}
                    {volumeInfo.pageCount}
                  </div>
                )}
                {volumeInfo.categories && (
                  <div>
                    <span className="font-semibold">Categories:</span>{" "}
                    {volumeInfo.categories.join(", ")}
                  </div>
                )}
              </div>

              {/* Description */}
              {volumeInfo.description && (
                <div className="mt-4">
                  <h2 className="text-xl font-semibold mb-2">Description</h2>
                  <BookDescription description={volumeInfo.description} />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
