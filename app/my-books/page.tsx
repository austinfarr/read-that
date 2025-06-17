import { Book } from "@/types/book";
import { getBooksByIds, hardcoverToBook } from "@/utils/hardcover";
import { SAMPLE_USER_ID, type UserBook } from "@/utils/supabase";
import { BookOpen } from "lucide-react";
import MyBooksClient from "./MyBooksClient";

// Server-side data fetching
async function fetchUserBooks(): Promise<{
  userBooks: UserBook[];
  booksData: Record<string, Book>;
}> {
  try {
    // Import server client dynamically to avoid edge cases
    const { createClient } = await import("@/utils/supabase/server");
    const supabase = await createClient();

    // First, fetch user books from Supabase
    const { data, error } = await supabase
      .from("user_books")
      .select("*")
      .eq("user_id", SAMPLE_USER_ID)
      .order("updated_at", { ascending: false });

    if (error) throw error;

    const userBooksData = data || [];

    // Extract unique hardcover IDs
    const hardcoverIds = userBooksData
      .filter((ub) => ub.hardcover_id)
      .map((ub) => ub.hardcover_id as string);

    let booksData: Record<string, Book> = {};

    if (hardcoverIds.length > 0) {
      // Fetch book details from Hardcover API
      const books = await getBooksByIds(hardcoverIds);

      // Convert to a map for easy lookup
      books.forEach((book) => {
        booksData[book.id.toString()] = hardcoverToBook(book);
      });
    }

    return { userBooks: userBooksData, booksData };
  } catch (error) {
    console.error("Error fetching user books:", error);
    return { userBooks: [], booksData: {} };
  }
}

export default async function MyBooksPage() {
  const { userBooks, booksData } = await fetchUserBooks();

  return (
    <div className="min-h-screen pt-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <BookOpen className="w-8 h-8 text-primary" />
          <h1 className="text-4xl font-bold">My Books</h1>
        </div>

        <MyBooksClient userBooks={userBooks} booksData={booksData} />
      </div>
    </div>
  );
}
