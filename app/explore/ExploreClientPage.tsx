"use client";
import { Book } from "@/types/book";
import { CategorizedBooks } from "@/lib/hardcover-api";
import { useRouter } from "next/navigation";
import React from "react";
import ScrollableBookSection from "@/components/ScrollableBookSection";

interface ExploreClientPageProps {
  categorizedBooks: CategorizedBooks;
}

export default function ExploreClientPage({ categorizedBooks }: ExploreClientPageProps) {
  const router = useRouter();

  const handleBookClick = (book: Book) => {
    // Navigate to the book detail page
    router.push(`/books/${book.id}`);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Discover Your Next Great Read</h1>
        <p className="text-muted-foreground">Handpicked recommendations across different genres</p>
      </div>

      <ScrollableBookSection 
        title="Science Fiction & Fantasy"
        books={categorizedBooks.sciFiFantasy}
        onBookClick={handleBookClick}
      />

      <ScrollableBookSection 
        title="Classic Literature"
        books={categorizedBooks.classicLiterature}
        onBookClick={handleBookClick}
      />

      <ScrollableBookSection 
        title="Modern Fiction"
        books={categorizedBooks.modernFiction}
        onBookClick={handleBookClick}
      />

      <div className="text-center py-8">
        <p className="text-muted-foreground">Enjoying these recommendations? More categories coming soon!</p>
      </div>
    </div>
  );
}