import { getAuthorById, getBooksByAuthor } from "@/lib/hardcover-api";
import { AuthorBiography } from "@/components/AuthorBiography";
import AuthorBookCard from "@/components/AuthorBookCard";
import Image from "next/image";
import { notFound } from "next/navigation";

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const authorId = parseInt(id);

  if (isNaN(authorId)) {
    notFound();
  }

  const [author, books] = await Promise.all([
    getAuthorById(authorId),
    getBooksByAuthor(authorId),
  ]);

  if (!author) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 pt-[100px]">
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        {(author.image?.url || author.cached_image) && (
          <div className="flex-shrink-0">
            <Image
              src={author.image?.url || author.cached_image || ""}
              alt={author.name}
              width={200}
              height={200}
              className="rounded-lg shadow-lg"
            />
          </div>
        )}

        <div className="flex-1">
          <h1 className="text-4xl font-bold mb-4">{author.name}</h1>

          {author.bio && (
            <div className="mb-4">
              <AuthorBiography biography={author.bio} />
            </div>
          )}

          {author.location && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold">Location:</span> {author.location}
            </p>
          )}

          {author.books_count && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              <span className="font-semibold">Total Books:</span>{" "}
              {author.books_count}
            </p>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">
          Books by {author.name} ({books.length})
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {books.map((book) => (
            <AuthorBookCard key={book.id} book={book} />
          ))}
        </div>
      </div>
    </div>
  );
}
