import { getAuthorById, getBooksByAuthor } from "@/lib/hardcover-api";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function AuthorPage({
  params,
}: {
  params: { id: string };
}) {
  const authorId = parseInt(params.id);

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
            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
              {author.bio}
            </p>
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
            <Link key={book.id} href={`/books/${book.id}`} className="group">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-transform group-hover:scale-105">
                {book.image?.url ? (
                  <Image
                    src={book.image.url}
                    alt={book.title}
                    width={200}
                    height={300}
                    className="w-full h-64 object-cover"
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-gray-400">No cover</span>
                  </div>
                )}

                <div className="p-4">
                  <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                    {book.title}
                  </h3>
                  {book.release_date && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(book.release_date).getFullYear()}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
