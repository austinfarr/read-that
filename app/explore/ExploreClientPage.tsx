"use client";
import { Book } from "@/types/book";
import { CategorizedBooks } from "@/lib/hardcover-api";
import { useRouter } from "next/navigation";
import React from "react";
import ScrollableBookSection from "@/components/ScrollableBookSection";
import { Sparkles, BookOpen, Star, TrendingUp } from "lucide-react";

interface ExploreClientPageProps {
  categorizedBooks: CategorizedBooks;
}

export default function ExploreClientPage({
  categorizedBooks,
}: ExploreClientPageProps) {
  const router = useRouter();

  const handleBookClick = (book: Book) => {
    // Navigate to the book detail page
    router.push(`/books/${book.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/50 to-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-teal-500/20 dark:from-purple-500/10 dark:via-blue-500/10 dark:to-teal-500/10" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-1/4 w-2 h-2 bg-blue-400 dark:bg-blue-400 rounded-full animate-pulse" />
          <div className="absolute top-32 right-1/3 w-1 h-1 bg-purple-400 dark:bg-purple-400 rounded-full animate-pulse delay-300" />
          <div className="absolute top-40 left-1/3 w-1.5 h-1.5 bg-teal-400 dark:bg-teal-400 rounded-full animate-pulse delay-700" />
          <div className="absolute top-28 right-1/4 w-1 h-1 bg-yellow-400 dark:bg-yellow-400 rounded-full animate-pulse delay-1000" />
        </div>

        <div className="container mx-auto pt-32 pb-8 px-4 relative">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-teal-500 dark:text-teal-400 mr-3 animate-pulse" />
              <h1 className="text-5xl font-bold bg-gradient-to-r from-foreground via-blue-600 to-teal-600 dark:from-white dark:via-blue-100 dark:to-teal-200 bg-clip-text text-transparent">
                Discover Your Next
              </h1>
              <Sparkles className="w-8 h-8 text-purple-500 dark:text-purple-400 ml-3 animate-pulse" />
            </div>
            <h2 className="text-5xl font-bold bg-gradient-to-r from-teal-500 via-blue-500 to-purple-500 dark:from-teal-400 dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-6">
              Great Read
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Curated collections of extraordinary books across genres,
              <span className="text-teal-600 dark:text-teal-300 font-medium">
                {" "}
                handpicked{" "}
              </span>
              just for curious minds like yours
            </p>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 mt-8">
              <div className="flex items-center gap-2 text-muted-foreground">
                <BookOpen className="w-5 h-5 text-teal-500 dark:text-teal-400" />
                <span className="text-lg font-medium">1000+ Books</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Star className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />
                <span className="text-lg font-medium">Highly Rated</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <TrendingUp className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                <span className="text-lg font-medium">Trending</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-16 mt-4">
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

        {/* Footer CTA */}
        <div className="text-center py-16 mt-8">
          <div className="bg-gradient-to-r from-muted/50 to-muted/30 backdrop-blur-sm rounded-2xl p-8 mx-auto max-w-2xl border border-border/20">
            <Sparkles className="w-12 h-12 text-teal-500 dark:text-teal-400 mx-auto mb-4 animate-pulse" />
            <h3 className="text-2xl font-bold text-foreground mb-4">
              More Amazing Collections Coming Soon
            </h3>
            <p className="text-muted-foreground text-lg leading-relaxed">
              We're constantly curating new collections of exceptional books.
              <span className="text-teal-600 dark:text-teal-300 font-medium">
                {" "}
                Stay tuned{" "}
              </span>
              for mystery, romance, biographies, and so much more!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
