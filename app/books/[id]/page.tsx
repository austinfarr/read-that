import { BookDescription } from "@/components/BookDescription";
import { Button } from "@/components/ui/button";
import { ReviewSection } from "@/components/reviews/ReviewSection";
import { getReviewStats } from "./actions";
import {
  Bookmark,
  BookOpen,
  Calendar,
  Heart,
  Share2,
  Sparkles,
  Star,
} from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";

// GraphQL query with verified fields
const GET_BOOK_DETAILS_QUERY = `
  query GetBookById($id: Int!) {
    books(where: {id: {_eq: $id}}) {
      id
      title
      subtitle
      description
      pages
      release_date
      slug
      image {
        url
      }
      contributions {
        author {
          name
        }
      }
    }
  }
`;

// Function to fetch book details from Hardcover API
async function getBookDetails(id: string) {
  const response = await fetch("https://api.hardcover.app/v1/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.HARDCOVER_API_TOKEN}`,
    },
    body: JSON.stringify({
      query: GET_BOOK_DETAILS_QUERY,
      variables: { id: parseInt(id) },
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch book details: ${response.statusText}`);
  }

  const data = await response.json();

  if (data.errors) {
    console.error("GraphQL errors:", data.errors);
    throw new Error("Failed to fetch book details from Hardcover");
  }

  if (!data.data.books || data.data.books.length === 0) {
    return null;
  }

  return data.data.books[0];
}

export default async function BookPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const book = await getBookDetails(id);

  if (!book) {
    notFound();
  }

  // Get review stats
  const reviewStats = await getReviewStats(id);

  // Extract authors from contributions
  const authors = book.contributions
    ?.filter((contribution: any) => contribution.author)
    .map((contribution: any) => contribution.author) || [
    { name: "Unknown Author" },
  ];

  // Placeholder genres until we can fetch them
  const genres: string[] = [];

  // Format release date
  const releaseYear = book.release_date
    ? new Date(book.release_date).getFullYear()
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Hero Section with Book Cover Background */}
      <div className="relative overflow-hidden">

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background z-10" />

        {/* Decorative elements */}
        <div className="absolute inset-0 z-20">
          <div className="absolute top-20 left-1/4 w-2 h-2 bg-teal-400 dark:bg-teal-400 rounded-full animate-pulse" />
          <div className="absolute top-32 right-1/3 w-1 h-1 bg-purple-400 dark:bg-purple-400 rounded-full animate-pulse delay-300" />
          <div className="absolute top-40 left-1/3 w-1.5 h-1.5 bg-blue-400 dark:bg-blue-400 rounded-full animate-pulse delay-700" />
        </div>

        {/* Content */}
        <div className="relative z-30 container mx-auto pt-24 sm:pt-32 pb-8 sm:pb-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-center lg:items-start">
              {/* Book Cover */}
              <div className="flex-shrink-0 w-full sm:w-auto flex flex-col items-center lg:items-start">
                <div className="relative group w-48 sm:w-64 lg:w-[280px]">
                  {/* Gradient border effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-teal-400 via-blue-500 to-purple-500 rounded-2xl opacity-75 group-hover:opacity-100 transition-all duration-500 blur-sm" />

                  <div className="relative w-48 h-72 sm:w-64 sm:h-96 lg:w-[280px] lg:h-[420px] rounded-xl overflow-hidden shadow-2xl">
                    {book.image?.url ? (
                      <Image
                        src={book.image.url}
                        alt={book.title}
                        fill
                        className="object-cover"
                        priority
                        sizes="(max-width: 640px) 192px, (max-width: 1024px) 256px, 280px"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex flex-col items-center justify-center text-slate-400">
                        <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 mb-4 opacity-60" />
                        <p className="text-xs sm:text-sm text-center px-4 opacity-60">
                          No Cover Available
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons - Desktop only (hidden on mobile) */}
                <div className="mt-4 sm:mt-6 w-full max-w-xs lg:max-w-none hidden sm:block">
                  <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-2">
                    <Button className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white text-sm px-4 py-2">
                      <Heart className="w-4 h-4 mr-2" />
                      Add to Favorites
                    </Button>
                    <Button
                      variant="outline"
                      className="border-purple-500/30 hover:border-purple-500 hover:bg-purple-500/10 text-sm px-4 py-2"
                    >
                      <Bookmark className="w-4 h-4 mr-2" />
                      Want to Read
                    </Button>
                    <Button variant="outline" className="text-sm px-4 py-2">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>

              {/* Book Info */}
              <div className="flex-1 space-y-4 sm:space-y-6 w-full lg:w-auto">
                {/* Title and Author */}
                <div className="text-center lg:text-left">
                  <div className="flex items-start justify-center lg:justify-start gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-teal-500 dark:text-teal-400 mt-1 flex-shrink-0" />
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent leading-tight">
                      {book.title}
                    </h1>
                  </div>
                  {book.subtitle && (
                    <h2 className="text-lg sm:text-xl lg:text-2xl text-muted-foreground mt-2 px-2 lg:px-0 lg:ml-8 xl:ml-11">
                      {book.subtitle}
                    </h2>
                  )}
                  <div className="flex items-center justify-center lg:justify-start gap-2 mt-3 sm:mt-4 text-base sm:text-lg px-2 lg:px-0 lg:ml-8 xl:ml-11">
                    <span className="text-muted-foreground">by</span>
                    <div className="flex flex-wrap justify-center lg:justify-start gap-1">
                      {authors.map((author: any, index: number) => (
                        <span key={index}>
                          <span className="text-teal-600 dark:text-teal-300 font-medium hover:underline cursor-pointer">
                            {author.name}
                          </span>
                          {index < authors.length - 1 && (
                            <span className="text-muted-foreground">, </span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Rating */}
                {reviewStats.totalReviews > 0 && (
                  <div className="flex items-center justify-center lg:justify-start gap-4 sm:gap-6 px-2 lg:px-0 lg:ml-8 xl:ml-11">
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 sm:w-5 sm:h-5 ${
                              star <= Math.round(reviewStats.averageRating)
                                ? "text-yellow-500 fill-yellow-500"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-base sm:text-lg font-medium">
                        {reviewStats.averageRating}
                      </span>
                      <span className="text-sm sm:text-base text-muted-foreground">
                        ({reviewStats.totalReviews} {reviewStats.totalReviews === 1 ? 'rating' : 'ratings'})
                      </span>
                    </div>
                  </div>
                )}

                {/* Action Buttons - Mobile only (hidden on desktop) */}
                <div className="block sm:hidden w-full px-2">
                  <div className="grid grid-cols-1 gap-2">
                    <Button className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white text-sm px-4 py-2 w-full">
                      <Heart className="w-4 h-4 mr-2" />
                      Add to Favorites
                    </Button>
                    <Button
                      variant="outline"
                      className="border-purple-500/30 hover:border-purple-500 hover:bg-purple-500/10 text-sm px-4 py-2 w-full"
                    >
                      <Bookmark className="w-4 h-4 mr-2" />
                      Want to Read
                    </Button>
                    <Button variant="outline" className="text-sm px-4 py-2 w-full">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>

                {/* Book Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 px-2 lg:px-0 lg:ml-8 xl:ml-11">
                  {releaseYear && (
                    <div className="bg-muted/50 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-border/20">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">Published</span>
                      </div>
                      <p className="font-semibold">{releaseYear}</p>
                    </div>
                  )}
                  {book.pages && (
                    <div className="bg-muted/50 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-border/20">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <BookOpen className="w-4 h-4" />
                        <span className="text-sm">Pages</span>
                      </div>
                      <p className="font-semibold">{book.pages}</p>
                    </div>
                  )}
                </div>

                {/* Genres */}
                {genres.length > 0 && (
                  <div className="px-2 lg:px-0 lg:ml-8 xl:ml-11">
                    <h3 className="text-sm font-medium text-muted-foreground mb-3 text-center lg:text-left">
                      Genres
                    </h3>
                    <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                      {genres.map((genre: string) => (
                        <span
                          key={genre}
                          className="px-3 py-1.5 bg-gradient-to-r from-teal-500/10 to-blue-500/10 backdrop-blur-sm rounded-full text-sm font-medium text-teal-700 dark:text-teal-300 border border-teal-500/20"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                {book.description && (
                  <div className="px-2 lg:px-0 lg:ml-8 xl:ml-11 mt-4 sm:mt-6">
                    <div className="bg-gradient-to-r from-muted/50 to-muted/30 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-border/20">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-1 h-6 bg-gradient-to-b from-teal-500 to-purple-500 dark:from-teal-400 dark:to-purple-400 rounded-full" />
                        <h3 className="text-base sm:text-lg font-bold">About this book</h3>
                      </div>
                      <BookDescription description={book.description} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="container mx-auto px-4 pb-8 sm:pb-16 max-w-6xl">
        <ReviewSection 
          hardcoverId={id} 
          bookId={undefined}
          bookTitle={book.title}
        />
      </div>

      {/* Similar Books Section (placeholder) */}
      <div className="container mx-auto px-4 pb-8 sm:pb-16 max-w-6xl">
        <div className="flex items-center justify-center lg:justify-start gap-3 mb-6 sm:mb-8">
          <div className="w-1 h-6 sm:h-8 bg-gradient-to-b from-purple-500 to-blue-500 dark:from-purple-400 dark:to-blue-400 rounded-full" />
          <h2 className="text-xl sm:text-2xl font-bold">Readers also enjoyed</h2>
        </div>
        <div className="bg-gradient-to-r from-muted/30 to-muted/20 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-border/20 text-center">
          <p className="text-sm sm:text-base text-muted-foreground">
            Similar book recommendations coming soon...
          </p>
        </div>
      </div>
    </div>
  );
}
