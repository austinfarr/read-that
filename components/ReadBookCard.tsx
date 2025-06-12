import Image from "next/image";

export default function ReadBookCard({ book }) {

  return (
    // Main container - full width with flex layout
    <div className="w-full max-w-2xl bg-card rounded-lg">
      <div className="flex">
        {/* Left side - Book cover container */}
        <div className="w-48 shrink-0">
          {/* Gradient border effect container */}
          <div className="p-[2px] group bg-transparent transition-all duration-300 hover:bg-gradient-to-r hover:from-teal-400 hover:via-blue-500 hover:to-purple-500">
            {/* Image container with hover effects */}
            <div className="relative rounded-lg transition-all duration-300 bg-gray-950 w-full">
              {/* Important: Fixed aspect ratio container */}
              <div className="relative aspect-[2/3] w-full ">
                <Image
                  alt={`Cover of ${book.title}`}
                  // className={`object-cover transition-all duration-300 group-hover:scale-110 group-hover:blur-[2px] ${
                  //   isLoading ? "grayscale blur-sm" : "grayscale-0 blur-0"
                  // }`}
                  src={book.thumbnail_url || "/api/placeholder/200/300"}
                  fill
                  // sizes="(max-width: 768px) 100vw, 200px"
                  priority
                />
                {/* Hover overlay with title */}
                <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 overflow-hidden rounded-lg backdrop-blur-md bg-white/10 opacity-0 transition-all duration-300 group-hover:opacity-100">
                  <p className="p-2 text-sm text-white text-center">
                    {book.title}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Book details */}
        <div className="flex-1 p-6">
          <h2 className="text-xl font-semibold mb-2">{book.title}</h2>
          <p className="text-muted-foreground mb-4">by {book.author}</p>

          {/* Rating */}
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <span className="text-primary">★★★★☆</span>
              <span className="text-sm text-muted-foreground">4.0/5.0</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground">{book.description}</p>

          {/* Page count */}
          <p className="text-sm text-muted-foreground mt-4">
            {book.pageCount} pages
          </p>
        </div>
      </div>
    </div>
  );
}
