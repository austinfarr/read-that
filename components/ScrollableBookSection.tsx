"use client";
import React, { useRef } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import BookCard from "@/components/BookCard";
import { HardcoverBook, Book } from "@/types/book";

interface ScrollableBookSectionProps {
  title: string;
  books: HardcoverBook[];
  icon?: React.ReactNode;
  description?: string;
}

export default function ScrollableBookSection({
  title,
  books,
  icon,
  description,
}: ScrollableBookSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      const scrollAmount = window.innerWidth < 640 ? -130 : window.innerWidth < 768 ? -160 : -190;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      const scrollAmount = window.innerWidth < 640 ? 130 : window.innerWidth < 768 ? 160 : 190;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  if (books.length === 0) return null;

  return (
    <div className="mb-8 sm:mb-12 md:mb-16 relative">
      {/* Section Header */}
      <div className="mb-4 sm:mb-6 md:mb-8 relative">
        <div className="flex items-center gap-2 sm:gap-3 mb-2">
          <div className="w-0.5 sm:w-1 h-6 sm:h-8 bg-gradient-to-b from-teal-500 to-purple-500 dark:from-teal-400 dark:to-purple-400 rounded-full" />
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">{title}</h2>
          {icon || <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-teal-500 dark:text-teal-400 animate-pulse" />}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground ml-4 sm:ml-6 md:ml-7 mt-1">
            {description}
          </p>
        )}
        <div className="w-16 sm:w-20 md:w-24 h-0.5 sm:h-1 bg-gradient-to-r from-teal-500 to-purple-500 dark:from-teal-400 dark:to-purple-400 rounded-full ml-4 sm:ml-6 md:ml-7 mt-2" />
      </div>
      <div className="relative scroll-section-container group/scroll bg-gradient-to-r from-muted/30 via-muted/20 to-muted/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 border border-border/20 backdrop-blur-sm">
        {/* Left Arrow */}
        <Button
          variant="outline"
          size="icon"
          className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 z-10 bg-background/90 backdrop-blur-sm border-teal-500/30 dark:border-teal-400/30 hover:border-teal-500 dark:hover:border-teal-400 hover:bg-teal-500/10 dark:hover:bg-teal-400/10 text-teal-500 dark:text-teal-400 opacity-0 group-hover/scroll:opacity-100 transition-all duration-300 shadow-lg hidden sm:flex"
          onClick={scrollLeft}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        {/* Right Arrow */}
        <Button
          variant="outline"
          size="icon"
          className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 z-10 bg-background/90 backdrop-blur-sm border-teal-500/30 dark:border-teal-400/30 hover:border-teal-500 dark:hover:border-teal-400 hover:bg-teal-500/10 dark:hover:bg-teal-400/10 text-teal-500 dark:text-teal-400 opacity-0 group-hover/scroll:opacity-100 transition-all duration-300 shadow-lg hidden sm:flex"
          onClick={scrollRight}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>

        {/* Scrollable container */}
        <div
          ref={scrollRef}
          className="flex gap-3 sm:gap-4 md:gap-6 overflow-x-auto overflow-y-hidden scrollbar-hide px-2 sm:px-4 md:px-8 py-2 sm:py-3 md:py-4"
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
