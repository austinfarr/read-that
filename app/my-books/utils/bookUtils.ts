import { type UserBook } from "@/utils/supabase";
import { Book } from "@/types/book";

export function convertToBookType(
  userBook: UserBook,
  booksData: Record<string, Book>
): Book {
  // Try to get book data from Hardcover API response
  if (userBook.hardcover_id && booksData[userBook.hardcover_id]) {
    return booksData[userBook.hardcover_id];
  }

  // Fallback if no book data
  return {
    id: userBook.id,
    title: "Unknown Book",
    author: "Unknown Author",
    coverUrl: undefined,
    description: undefined,
    pageCount: undefined,
  };
}

export function getStatusLabel(status: UserBook["status"]) {
  switch (status) {
    case "want_to_read":
      return "Want to Read";
    case "reading":
      return "Currently Reading";
    case "finished":
      return "Finished";
    case "dnf":
      return "Did Not Finish";
    default:
      return status;
  }
}

export function getStatusStyle(status: UserBook["status"]) {
  switch (status) {
    case "reading":
      return "bg-blue-100 text-blue-700";
    case "finished":
      return "bg-green-100 text-green-700";
    case "want_to_read":
      return "bg-amber-100 text-amber-700";
    case "dnf":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

export function sortBooksByActivity(userBooks: UserBook[]): UserBook[] {
  return [...userBooks].sort((a, b) => {
    const aDate = new Date(a.updated_at).getTime();
    const bDate = new Date(b.updated_at).getTime();
    return bDate - aDate;
  });
}

export type FilterType =
  | "all"
  | "reading"
  | "want_to_read"
  | "finished"
  | "favorites";

export function filterBooks(books: UserBook[], filter: FilterType): UserBook[] {
  if (filter === "all") return books;
  if (filter === "favorites") return books.filter((book) => book.is_favorite);
  return books.filter((book) => book.status === filter);
}

export function getFilterCounts(userBooks: UserBook[]) {
  return {
    all: userBooks.length,
    reading: userBooks.filter((ub) => ub.status === "reading").length,
    want_to_read: userBooks.filter((ub) => ub.status === "want_to_read").length,
    finished: userBooks.filter((ub) => ub.status === "finished").length,
    favorites: userBooks.filter((ub) => ub.is_favorite).length,
  };
}
