import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { BookDescription } from "@/components/BookDescription";
import { notFound } from "next/navigation";

// Function to fetch book details from Hardcover API
async function getBookDetails(id: string) {
  console.log("Fetching book details for ID:", id);
  const query = `
    query GetBookById($id: Int!) {
      books(where: {id: {_eq: $id}}) {
        title
        release_date
        slug
        subtitle
        pages
        description
        image {
          url
        }
        contributions {
          author {
            name
          }
        }
      }
    }
  `;

  // Make the GraphQL request to Hardcover
  const response = await fetch("https://api.hardcover.app/v1/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.HARDCOVER_API_TOKEN}`,
    },
    body: JSON.stringify({
      query,
      variables: { id: parseInt(id) },
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch book details: ${response.statusText}`);
  }

  const data = await response.json();
  console.log("GraphQL response:", data);

  // Handle errors in the GraphQL response
  if (data.errors) {
    console.error("GraphQL errors:", data.errors);
    throw new Error("Failed to fetch book details from Hardcover");
  }

  // If no books found, return null
  if (!data.data.books || data.data.books.length === 0) {
    return null;
  }

  // Get the first book data
  return data.data.books[0];
}

export default async function BookPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const book = await getBookDetails(id);

  // Handle case where book doesn't exist
  if (!book) {
    notFound();
  }

  // Extract authors from contributions
  const authors = book.contributions
    ?.filter((contribution) => contribution.author)
    .map((contribution) => contribution.author.name) || ["Unknown Author"];

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Book cover */}
            <div className="relative w-[200px] h-[300px] shrink-0 mx-auto md:mx-0">
              {book.image?.url ? (
                <Image
                  src={book.image.url}
                  alt={book.title}
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
              <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
              {book.subtitle && (
                <h2 className="text-xl text-muted-foreground mb-2">
                  {book.subtitle}
                </h2>
              )}
              <p className="text-lg text-muted-foreground mb-4">
                by {authors.join(", ")}
              </p>

              {/* Book metadata */}
              <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                {book.release_date && (
                  <div>
                    <span className="font-semibold">Published:</span>{" "}
                    {new Date(book.release_date).toLocaleDateString()}
                  </div>
                )}
                {book.pages && (
                  <div>
                    <span className="font-semibold">Pages:</span> {book.pages}
                  </div>
                )}
              </div>

              {/* Description */}
              {book.description && (
                <div className="mt-4">
                  <h2 className="text-xl font-semibold mb-2">Description</h2>
                  <BookDescription description={book.description} />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
