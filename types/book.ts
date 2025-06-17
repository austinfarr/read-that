// Unified book types for the application

// Base book interface for common properties
export interface BaseBook {
  id: string | number;
  title: string;
  description?: string;
}

// Hardcover API book structure (from GraphQL responses)
export interface HardcoverBook extends BaseBook {
  id: string;
  subtitle?: string;
  pages?: number;
  release_date?: string;
  slug?: string;
  image?: {
    url: string;
  };
  contributions?: Array<{
    author: {
      name: string;
    };
  }>;
}

// Hardcover API search result structure
export interface HardcoverSearchBook extends BaseBook {
  id: string;
  author_names?: string[];
  image?: {
    url: string;
  };
}

// Local book structure (for hardcoded data and user books)
export interface LocalBook extends BaseBook {
  id: number;
  author: string;
  pageCount?: number;
  unread?: boolean;
}

// Unified book interface for components
export interface Book {
  id: string | number;
  title: string;
  author: string | string[];
  imageUrl?: string;
  description?: string;
  pageCount?: number;
  releaseDate?: string;
  subtitle?: string;
  unread?: boolean;
}

// Utility function to normalize different book types to the unified Book interface
export function normalizeBook(
  book: HardcoverBook | HardcoverSearchBook | LocalBook
): Book {
  // Handle HardcoverBook (from book detail page)
  if ("contributions" in book) {
    const hardcoverBook = book as HardcoverBook;
    return {
      id: hardcoverBook.id,
      title: hardcoverBook.title,
      author: hardcoverBook.contributions?.map((c) => c.author.name) || [
        "Unknown Author",
      ],
      imageUrl: hardcoverBook.image?.url,
      description: hardcoverBook.description,
      pageCount: hardcoverBook.pages,
      releaseDate: hardcoverBook.release_date,
      subtitle: hardcoverBook.subtitle,
    };
  }

  // Handle HardcoverSearchBook (from search results)
  if ("author_names" in book) {
    const searchBook = book as HardcoverSearchBook;
    return {
      id: searchBook.id,
      title: searchBook.title,
      author: searchBook.author_names || ["Unknown Author"],
      imageUrl: searchBook.image?.url,
      description: searchBook.description,
    };
  }

  // Handle LocalBook (hardcoded data)
  const localBook = book as LocalBook;
  return {
    id: localBook.id,
    title: localBook.title,
    author: localBook.author,
    imageUrl: localBook.coverUrl || "",
    description: localBook.description,
    pageCount: localBook.pageCount,
    unread: localBook.unread,
  };
}
