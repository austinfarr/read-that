import { BookOpen } from "lucide-react";
import { BooksLibrary } from "@/app/my-books/components/BooksLibrary";
import { fetchUserBooks } from "@/app/my-books/actions";

export default async function MyBooksPage() {
  const { userBooks, booksData } = await fetchUserBooks();

  return (
    <div className="min-h-screen pt-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <BookOpen className="w-8 h-8 text-primary" />
          <h1 className="text-4xl font-bold">My Books</h1>
        </div>

        <BooksLibrary userBooks={userBooks} booksData={booksData} />
      </div>
    </div>
  );
}
