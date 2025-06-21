export function BooksLibraryLoading() {
  return (
    <div className="space-y-8">
      {/* Filter skeleton */}
      <div className="flex flex-wrap gap-3 justify-center">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
          />
        ))}
      </div>

      {/* Books list skeleton */}
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4"
          >
            <div className="flex gap-4">
              {/* Book cover skeleton */}
              <div className="w-16 h-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse flex-shrink-0" />
              
              <div className="flex-1 space-y-3">
                {/* Title skeleton */}
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
                
                {/* Author skeleton */}
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2" />
                
                {/* Status and progress skeleton */}
                <div className="flex gap-2">
                  <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
                
                {/* Action buttons skeleton */}
                <div className="flex gap-2 mt-3">
                  <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}