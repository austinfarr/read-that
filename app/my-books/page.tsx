import { Suspense } from "react";
import { BookOpen } from "lucide-react";
import { BooksLibraryData } from "@/app/my-books/components/BooksLibraryData";
import { BooksLibraryLoading } from "@/app/my-books/components/BooksLibraryLoading";

export const dynamic = "force-dynamic";

export default function MyBooksPage() {
  return (
    <div className="min-h-screen pt-24 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-center items-center">
          <h1 className="text-4xl font-bold mt-10 mb-2 text-center flex items-center gap-4">
            Your Bookshelf
            <BookOpen className="w-8 h-8 text-primary" />
          </h1>
        </div>
        <Suspense fallback={<BooksLibraryLoading />}>
          <BooksLibraryData />
        </Suspense>
      </div>
    </div>
  );
}
