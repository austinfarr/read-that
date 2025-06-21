import { type UserBook } from "@/utils/supabase";
import { Book } from "@/types/book";
import { BookListItem } from "./BookListItem";
import { convertToBookType } from "../utils/bookUtils";

interface BookListProps {
  userBooks: UserBook[];
  booksData: Record<string, Book>;
}

export function BookList({ userBooks, booksData }: BookListProps) {
  if (userBooks.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No books found for the selected filter</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {userBooks.map((userBook) => {
        const book = convertToBookType(userBook, booksData);
        return (
          <BookListItem
            key={userBook.id}
            userBook={userBook}
            book={book}
          />
        );
      })}
    </div>
  );
}