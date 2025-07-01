import Image from "next/image";
import Link from "next/link";
import { HardcoverBook } from "@/types/book";

interface AuthorBookCardProps {
  book: HardcoverBook;
}

export default function AuthorBookCard({ book }: AuthorBookCardProps) {
  return (
    <Link href={`/books/${book.id}`} className="group">
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-transform
  group-hover:scale-105"
      >
        <div className="relative w-full aspect-[2/3]">
          {book.image?.url ? (
            <Image
              src={book.image.url}
              alt={book.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-gray-400">No cover</span>
            </div>
          )}
        </div>

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
  );
}
