import { BookOpen } from "lucide-react";
import { BooksLibrary } from "@/app/my-books/components/BooksLibrary";
import { fetchUserBooks } from "@/app/my-books/actions";

export default async function MyBooksPage() {
  const { userBooks, booksData } = await fetchUserBooks();

  return (
    <div className="min-h-screen pt-24 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-center items-center">
          <h1 className="text-4xl font-bold my-10 text-center flex items-center gap-4">
            Your Bookshelf
            <BookOpen className="w-8 h-8 text-primary" />
          </h1>
        </div>
        <BooksLibrary userBooks={userBooks} booksData={booksData} />
      </div>
    </div>
  );
}
