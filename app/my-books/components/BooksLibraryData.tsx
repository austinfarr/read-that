import { BooksLibrary } from "./BooksLibrary";
import { fetchUserBooks } from "../actions";

export async function BooksLibraryData() {
  const { userBooks, booksData, ratings } = await fetchUserBooks();

  return <BooksLibrary userBooks={userBooks} booksData={booksData} ratings={ratings} />;
}