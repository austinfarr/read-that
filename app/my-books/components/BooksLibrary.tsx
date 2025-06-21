"use client";

import { useState } from "react";
import { type UserBook } from "@/utils/supabase";
import { Book } from "@/types/book";
import { BookFilters } from "./BookFilters";
import { BookList } from "./BookList";
import { 
  FilterType, 
  sortBooksByActivity, 
  filterBooks, 
  getFilterCounts 
} from "../utils/bookUtils";

interface BooksLibraryProps {
  userBooks: UserBook[];
  booksData: Record<string, Book>;
}

export function BooksLibrary({ userBooks, booksData }: BooksLibraryProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  // Sort all books by most recent activity
  const sortedBooks = sortBooksByActivity(userBooks);

  // Filter books based on active filter
  const filteredBooks = filterBooks(sortedBooks, activeFilter);

  // Get filter counts
  const filterCounts = getFilterCounts(userBooks);

  return (
    <div className="space-y-8">
      <BookFilters
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        filterCounts={filterCounts}
      />

      <BookList
        userBooks={filteredBooks}
        booksData={booksData}
      />
    </div>
  );
}
