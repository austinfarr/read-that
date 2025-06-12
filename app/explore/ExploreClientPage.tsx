"use client";
import BookCard from "@/components/BookCard";
import { HardcoverBook, Book } from "@/types/book";
import { useRouter } from "next/navigation";
import React from "react";

interface ExploreClientPageProps {
  books: HardcoverBook[];
}

export default function ExploreClientPage({ books }: ExploreClientPageProps) {
  const router = useRouter();

  const handleBookClick = (book: Book) => {
    // Navigate to the book detail page
    router.push(`/books/${book.id}`);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Discover Your Next Great Read</h1>
        <p className="text-muted-foreground">Handpicked recommendations based on popular favorites</p>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Science Fiction & Fantasy</h2>
        <div className="flex gap-6 w-full flex-wrap justify-center sm:justify-start">
          {books.slice(0, 3).map((book) => (
            <BookCard 
              key={book.id} 
              book={book} 
              onClick={handleBookClick}
            />
          ))}
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">More Great Reads</h2>
        <div className="flex gap-6 w-full flex-wrap justify-center sm:justify-start">
          {books.slice(3).map((book) => (
            <BookCard 
              key={book.id} 
              book={book} 
              onClick={handleBookClick}
            />
          ))}
        </div>
      </div>

      <div className="text-center py-8">
        <p className="text-muted-foreground">More recommendations coming soon...</p>
      </div>
    </div>
  );
}