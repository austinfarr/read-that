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
        <div className="relative z-30 container mx-auto pt-24 sm:pt-32 pb-8 sm:pb-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-center lg:items-start">
              {/* Book Cover Skeleton */}
              <div className="flex-shrink-0 w-full sm:w-auto flex flex-col items-center lg:items-start">
                <div className="relative group w-48 sm:w-64 lg:w-[280px]">
                  <div className="absolute -inset-1 bg-gradient-to-r from-teal-400 via-blue-500 to-purple-500 rounded-2xl opacity-20 blur-sm animate-pulse" />
                  <div className="relative w-48 h-72 sm:w-64 sm:h-96 lg:w-[280px] lg:h-[420px] rounded-xl overflow-hidden bg-muted animate-pulse" />
                </div>

                {/* Action Buttons Skeleton - Desktop only */}
                <div className="mt-4 sm:mt-6 w-full max-w-xs lg:max-w-none hidden sm:block">
                  <div className="grid grid-cols-1 gap-2">
                    <div className="h-10 bg-muted rounded-lg animate-pulse" />
                    <div className="h-10 bg-muted rounded-lg animate-pulse delay-100" />
                  </div>
                </div>
              </div>

              {/* Book Info Skeleton */}
              <div className="flex-1 space-y-4 sm:space-y-6 w-full lg:w-auto">
                {/* Title and Author */}
                <div className="text-center lg:text-left">
                  <div className="flex items-start justify-center lg:justify-start gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-teal-500 dark:text-teal-400 mt-1 flex-shrink-0 animate-pulse" />
                    <div className="flex-1">
                      <div className="h-8 sm:h-12 lg:h-16 bg-muted rounded-lg animate-pulse mb-2 sm:mb-3" />
                      <div className="h-6 sm:h-8 bg-muted rounded-lg animate-pulse w-3/4 mx-auto lg:mx-0" />
                    </div>
                  </div>
                  <div className="h-5 sm:h-6 bg-muted rounded-lg animate-pulse w-1/2 mx-auto lg:mx-0 lg:ml-8 xl:ml-11 mt-3 sm:mt-4" />
                </div>

                {/* Rating Skeleton */}
                <div className="flex items-center justify-center lg:justify-start gap-4 sm:gap-6 px-2 lg:px-0 lg:ml-8 xl:ml-11">
                  <div className="h-5 sm:h-6 bg-muted rounded-lg animate-pulse w-40 sm:w-48" />
                </div>

                {/* Action Buttons Skeleton - Mobile only */}
                <div className="block sm:hidden w-full px-2">
                  <div className="grid grid-cols-1 gap-2">
                    <div className="h-10 bg-muted rounded-lg animate-pulse" />
                    <div className="h-10 bg-muted rounded-lg animate-pulse delay-100" />
                  </div>
                </div>

                {/* Book Details Grid Skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 px-2 lg:px-0 lg:ml-8 xl:ml-11">
                  {[1, 2].map((i) => (
                    <div key={i} className="bg-muted/50 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-border/20 animate-pulse">
                      <div className="h-4 bg-muted rounded mb-2 w-20" />
                      <div className="h-6 bg-muted rounded w-16" />
                    </div>
                  ))}
                </div>

                {/* Genres Skeleton */}
                <div className="px-2 lg:px-0 lg:ml-8 xl:ml-11">
                  <div className="h-4 bg-muted rounded w-16 mb-3 animate-pulse text-center lg:text-left" />
                  <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-8 bg-muted rounded-full animate-pulse" style={{ width: `${80 + i * 20}px` }} />
                    ))}
                  </div>
                </div>

                {/* Description Skeleton */}
                <div className="px-2 lg:px-0 lg:ml-8 xl:ml-11 mt-4 sm:mt-6">
                  <div className="bg-gradient-to-r from-muted/50 to-muted/30 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-border/20">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-1 h-6 bg-gradient-to-b from-teal-500 to-purple-500 dark:from-teal-400 dark:to-purple-400 rounded-full animate-pulse" />
                      <div className="h-5 sm:h-6 bg-muted rounded-lg animate-pulse w-32 sm:w-40" />
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
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section Skeleton */}
      <div className="container mx-auto px-4 pb-8 py-8 sm:pb-16 max-w-6xl">
        <div className="space-y-6 sm:space-y-8">
          {/* Reviews Header */}
          <div className="flex items-center justify-center lg:justify-start gap-3 mb-6 sm:mb-8">
            <div className="w-1 h-6 sm:h-8 bg-gradient-to-b from-teal-500 to-purple-500 dark:from-teal-400 dark:to-purple-400 rounded-full animate-pulse" />
            <div className="h-6 sm:h-8 bg-muted rounded-lg animate-pulse w-32 sm:w-40" />
          </div>
          
          {/* Review Items */}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-muted/30 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-border/20 animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-muted rounded-full animate-pulse flex-shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="h-5 bg-muted rounded w-24 animate-pulse" />
                      <div className="h-4 bg-muted rounded w-20 animate-pulse" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded animate-pulse" />
                      <div className="h-4 bg-muted rounded animate-pulse w-11/12" />
                      <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Similar Books Section Skeleton */}
      <div className="container mx-auto px-4 pb-8 sm:pb-16 max-w-6xl">
        <div className="flex items-center justify-center lg:justify-start gap-3 mb-6 sm:mb-8">
          <div className="w-1 h-6 sm:h-8 bg-gradient-to-b from-purple-500 to-blue-500 dark:from-purple-400 dark:to-blue-400 rounded-full animate-pulse" />
          <div className="h-6 sm:h-8 bg-muted rounded-lg animate-pulse w-48 sm:w-56" />
        </div>
        <div className="bg-gradient-to-r from-muted/30 to-muted/20 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-border/20 text-center">
          <div className="h-4 sm:h-5 bg-muted rounded animate-pulse w-64 sm:w-80 mx-auto" />
        </div>
      </div>
    </div>
  );
}