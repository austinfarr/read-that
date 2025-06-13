"use client";
import React, { useRef } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import BookCard from "@/components/BookCard";
import { HardcoverBook, Book } from "@/types/book";

interface ScrollableBookSectionProps {
  title: string;
  books: HardcoverBook[];
}

export default function ScrollableBookSection({
  title,
  books,
}: ScrollableBookSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -220, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 220, behavior: "smooth" });
    }
  };

  if (books.length === 0) return null;

  return (
    <div className="mb-16 relative">
      {/* Section Header */}
      <div className="mb-8 relative">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-8 bg-gradient-to-b from-teal-500 to-purple-500 dark:from-teal-400 dark:to-purple-400 rounded-full" />
          <h2 className="text-3xl font-bold text-foreground">{title}</h2>
          <Sparkles className="w-6 h-6 text-teal-500 dark:text-teal-400 animate-pulse" />
        </div>
        <div className="w-24 h-1 bg-gradient-to-r from-teal-500 to-purple-500 dark:from-teal-400 dark:to-purple-400 rounded-full ml-7" />
      </div>
      <div className="relative scroll-section-container group/scroll bg-gradient-to-r from-muted/30 via-muted/20 to-muted/30 rounded-2xl p-6 border border-border/20 backdrop-blur-sm">
        {/* Left Arrow */}
        <Button
          variant="outline"
          size="icon"
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-background/90 backdrop-blur-sm border-teal-500/30 dark:border-teal-400/30 hover:border-teal-500 dark:hover:border-teal-400 hover:bg-teal-500/10 dark:hover:bg-teal-400/10 text-teal-500 dark:text-teal-400 opacity-0 group-hover/scroll:opacity-100 transition-all duration-300 shadow-lg"
          onClick={scrollLeft}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        {/* Right Arrow */}
        <Button
          variant="outline"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-background/90 backdrop-blur-sm border-teal-500/30 dark:border-teal-400/30 hover:border-teal-500 dark:hover:border-teal-400 hover:bg-teal-500/10 dark:hover:bg-teal-400/10 text-teal-500 dark:text-teal-400 opacity-0 group-hover/scroll:opacity-100 transition-all duration-300 shadow-lg"
          onClick={scrollRight}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>

        {/* Scrollable container */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto overflow-y-hidden scrollbar-hide px-8 py-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {books.map((book) => (
            <div key={book.id} className="flex-shrink-0">
              <BookCard 
                book={book} 
                href={`/books/${book.id}`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
