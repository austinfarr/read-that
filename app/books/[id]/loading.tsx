import { Sparkles } from "lucide-react";

export default function BookLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Hero Section Skeleton */}
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
        <div className="relative z-30 container mx-auto pt-32 pb-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-12 items-start">
              {/* Book Cover Skeleton */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-teal-400 via-blue-500 to-purple-500 rounded-2xl opacity-20 blur-sm animate-pulse" />
                  <div className="relative w-[280px] h-[420px] rounded-xl overflow-hidden bg-muted animate-pulse" />
                </div>

                {/* Action Buttons Skeleton */}
                <div className="mt-6 space-y-3">
                  <div className="w-full h-10 bg-muted rounded-lg animate-pulse" />
                  <div className="w-full h-10 bg-muted rounded-lg animate-pulse delay-100" />
                  <div className="w-full h-10 bg-muted rounded-lg animate-pulse delay-200" />
                </div>
              </div>

              {/* Book Info Skeleton */}
              <div className="flex-1 space-y-6">
                {/* Title and Author */}
                <div>
                  <div className="flex items-start gap-3 mb-3">
                    <Sparkles className="w-8 h-8 text-teal-500 dark:text-teal-400 mt-1 flex-shrink-0 animate-pulse" />
                    <div className="flex-1">
                      <div className="h-12 bg-muted rounded-lg animate-pulse mb-3" />
                      <div className="h-8 bg-muted rounded-lg animate-pulse w-3/4" />
                    </div>
                  </div>
                  <div className="h-6 bg-muted rounded-lg animate-pulse w-1/3 ml-11 mt-4" />
                </div>

                {/* Rating Skeleton */}
                <div className="flex items-center gap-6 ml-11">
                  <div className="h-6 bg-muted rounded-lg animate-pulse w-48" />
                </div>

                {/* Book Details Grid Skeleton */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 ml-11">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-muted/50 backdrop-blur-sm rounded-xl p-4 border border-border/20 animate-pulse">
                      <div className="h-4 bg-muted rounded mb-2 w-20" />
                      <div className="h-6 bg-muted rounded w-16" />
                    </div>
                  ))}
                </div>

                {/* Genres Skeleton */}
                <div className="ml-11">
                  <div className="h-4 bg-muted rounded w-16 mb-3 animate-pulse" />
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-8 bg-muted rounded-full animate-pulse" style={{ width: `${80 + i * 20}px` }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description Section Skeleton */}
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="bg-gradient-to-r from-muted/50 to-muted/30 backdrop-blur-sm rounded-2xl p-8 border border-border/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-teal-500 to-purple-500 dark:from-teal-400 dark:to-purple-400 rounded-full animate-pulse" />
            <div className="h-8 bg-muted rounded-lg animate-pulse w-48" />
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded animate-pulse w-11/12" />
            <div className="h-4 bg-muted rounded animate-pulse w-10/12" />
            <div className="h-4 bg-muted rounded animate-pulse w-9/12" />
          </div>
        </div>
      </div>
    </div>
  );
}