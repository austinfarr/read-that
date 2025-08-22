// Hardcover API utilities for fetching book data

import { HardcoverBook } from "@/types/book";

const HARDCOVER_API_URL = "https://api.hardcover.app/v1/graphql";

// GraphQL query to fetch a single book by ID
const GET_BOOK_BY_ID_QUERY = `
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

// GraphQL query to fetch multiple books by IDs (using _in if available)
const GET_BOOKS_BY_IDS_QUERY = `
  query GetBooksByIds($ids: [Int!]!) {
    books(where: {id: {_in: $ids}}) {
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

// Function to make GraphQL requests to Hardcover API
async function makeHardcoverRequest(
  query: string,
  variables: any
): Promise<any> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000); // 8 second timeout

  try {
    const response = await fetch(HARDCOVER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.HARDCOVER_API_TOKEN}`,
        "User-Agent": "ReadThat-App/1.0", // Good practice as mentioned in docs
      },
      body: JSON.stringify({
        query,
        variables,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Hardcover API request failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.errors) {
      console.error("Hardcover API GraphQL errors:", data.errors);
      throw new Error("GraphQL query failed");
    }

    return data.data;
  } catch (error: any) {
    clearTimeout(timeout);
    if (error.name === "AbortError") {
      throw new Error("Hardcover API request timeout");
    }
    throw error;
  }
}

// Fetch a single book by ID
export async function getBookById(id: number): Promise<HardcoverBook | null> {
  try {
    const data = await makeHardcoverRequest(GET_BOOK_BY_ID_QUERY, { id });

    if (!data.books || data.books.length === 0) {
      return null;
    }

    return data.books[0] as HardcoverBook;
  } catch (error) {
    console.error(`Failed to fetch book ${id}:`, error);
    return null;
  }
}

// Fetch multiple books by IDs
export async function getBooksByIds(ids: number[]): Promise<HardcoverBook[]> {
  try {
    // First, try the bulk query approach
    const data = await makeHardcoverRequest(GET_BOOKS_BY_IDS_QUERY, { ids });
    return data.books as HardcoverBook[];
  } catch (error) {
    console.warn(
      "Bulk query failed, falling back to individual requests:",
      error
    );

    // Fallback: Make individual requests for each book
    const books: HardcoverBook[] = [];

    // Use Promise.allSettled to get partial results even if some fail
    const results = await Promise.allSettled(ids.map((id) => getBookById(id)));

    for (const result of results) {
      if (result.status === "fulfilled" && result.value) {
        books.push(result.value);
      }
    }

    return books;
  }
}

// Categorized books for the explore page
export interface CategorizedBooks {
  trending: HardcoverBook[];
  highestRated: HardcoverBook[];
  newReleases: HardcoverBook[];
  sciFiFantasy: HardcoverBook[];
  mystery: HardcoverBook[];
  romance: HardcoverBook[];
  nonFiction: HardcoverBook[];
  classics: HardcoverBook[];
}

// Dynamic queries for different book categories
const GET_BOOKS_BY_POPULARITY_QUERY = `
  query GetPopularBooks($limit: Int!) {
    books(
      where: {canonical_id: {_is_null: true}}
      order_by: {users_count: desc}
      limit: $limit
    ) {
      id
      title
      subtitle
      description
      pages
      release_date
      slug
      users_count
      ratings_count
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

const GET_BOOKS_BY_RATING_QUERY = `
  query GetHighestRatedBooks($limit: Int!) {
    books(
      where: {
        canonical_id: {_is_null: true},
        ratings_count: {_gt: 50}
      }
      order_by: {ratings_count: desc}
      limit: $limit
    ) {
      id
      title
      subtitle
      description
      pages
      release_date
      slug
      users_count
      ratings_count
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

const GET_RECENT_BOOKS_QUERY = `
  query GetRecentBooks($year: Int!, $limit: Int!) {
    books(
      where: {
        canonical_id: {_is_null: true},
        release_year: {_gte: 2024}
      }
      order_by: {users_count: desc}
      limit: $limit
    ) {
      id
      title
      subtitle
      description
      pages
      release_date
      release_year
      slug
      users_count
      ratings_count
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

// Fetch books by popularity (most users)
export async function getPopularBooks(
  limit: number = 12
): Promise<HardcoverBook[]> {
  try {
    const data = await makeHardcoverRequest(GET_BOOKS_BY_POPULARITY_QUERY, {
      limit,
    });
    return data.books as HardcoverBook[];
  } catch (error) {
    console.error("Failed to fetch popular books:", error);
    return [];
  }
}

// Fetch highest rated books
export async function getHighestRatedBooks(
  limit: number = 12
): Promise<HardcoverBook[]> {
  try {
    const data = await makeHardcoverRequest(GET_BOOKS_BY_RATING_QUERY, {
      limit,
    });
    return data.books as HardcoverBook[];
  } catch (error) {
    console.error("Failed to fetch highest rated books:", error);
    return [];
  }
}

// Fetch new releases (books from recent years)
export async function getNewReleases(
  limit: number = 12
): Promise<HardcoverBook[]> {
  try {
    const currentYear = new Date().getFullYear();
    const data = await makeHardcoverRequest(GET_RECENT_BOOKS_QUERY, {
      year: currentYear - 1, // Books from last 2 years
      limit,
    });
    return data.books as HardcoverBook[];
  } catch (error) {
    console.error("Failed to fetch new releases:", error);
    return [];
  }
}

// Fetch popular/recommended books for the explore page with dynamic categories
export async function getExploreBooks(): Promise<CategorizedBooks> {
  // Curated book IDs that we know exist and work well
  const trendingIds = [
    427578, // Project Hail Mary
    340654, // The Seven Husbands of Evelyn Hugo
    432761, // Atomic Habits
    430111, // Beach Read
    379753, // Educated
    266607, // Klara and the Sun
  ];

  const highestRatedIds = [
    312460, // Dune
    382700, // The Hobbit
    379760, // 1984
    386446, // The Way of Kings
    379217, // The Name of the Wind
    188628, // Foundation
  ];

  const newReleaseIds = [
    427578, // Project Hail Mary (2021)
    266607, // Klara and the Sun (2021)
    432478, // The Thursday Murder Club (2020)
    435002, // People We Meet on Vacation (2021)
    428889, // The Guest List (2020)
    427825, // The Fifth Season (recent award winner)
  ];

  const sciFiFantasyIds = [
    312460, // Dune
    369692, // Mistborn
    379217, // The Name of the Wind
    386446, // The Way of Kings
    313448, // Neuromancer
    158268, // Ender's Game
  ];

  const mysteryIds = [
    359823, // The Silent Patient
    432478, // The Thursday Murder Club
    428889, // The Guest List
    426673, // The 7½ Deaths of Evelyn Hardcastle
  ];

  const romanceIds = [
    340654, // The Seven Husbands of Evelyn Hugo
    430111, // Beach Read
    435002, // People We Meet on Vacation
    391653, // The Spanish Love Deception
  ];

  const nonFictionIds = [
    420320, // Sapiens
    379753, // Educated
    432761, // Atomic Habits
    426958, // Becoming
  ];

  const classicsIds = [
    379760, // 1984
    374328, // Brave New World
    382700, // The Hobbit
    382698, // Pride and Prejudice
  ];

  try {
    // Fetch all categories using curated IDs to avoid timeout issues
    const [
      trendingBooks,
      highestRatedBooks,
      newReleasesBooks,
      sciFiFantasyBooks,
      mysteryBooks,
      romanceBooks,
      nonFictionBooks,
      classicBooks,
    ] = await Promise.all([
      getBooksByIds(trendingIds),
      getBooksByIds(highestRatedIds),
      getBooksByIds(newReleaseIds),
      getBooksByIds(sciFiFantasyIds),
      getBooksByIds(mysteryIds),
      getBooksByIds(romanceIds),
      getBooksByIds(nonFictionIds),
      getBooksByIds(classicsIds),
    ]);

    return {
      trending: trendingBooks,
      highestRated: highestRatedBooks,
      newReleases: newReleasesBooks,
      sciFiFantasy: sciFiFantasyBooks,
      mystery: mysteryBooks,
      romance: romanceBooks,
      nonFiction: nonFictionBooks,
      classics: classicBooks,
    };
  } catch (error) {
    console.error("Failed to fetch explore books:", error);
    return {
      trending: [],
      highestRated: [],
      newReleases: [],
      sciFiFantasy: [],
      mystery: [],
      romance: [],
      nonFiction: [],
      classics: [],
    };
  }
}

// Search for books to find their Hardcover IDs
export async function searchBooks(
  query: string,
  limit: number = 5
): Promise<any[]> {
  const SEARCH_QUERY = `
    query SearchBooks($query: String!, $per_page: Int!) {
      search(query: $query, query_type: "Title", per_page: $per_page, page: 1) {
        results
      }
    }
  `;

  try {
    const data = await makeHardcoverRequest(SEARCH_QUERY, {
      query,
      per_page: limit,
    });

    // Parse the results object which contains the hits
    const results = data.search?.results;
    if (typeof results === "object" && results.hits) {
      return results.hits;
    }

    return [];
  } catch (error) {
    console.error("Search failed:", error);
    return [];
  }
}

// Author-related types
export interface HardcoverAuthor {
  id: string;
  name: string;
  bio?: string;
  cached_image?: string;
  image?: {
    url: string;
  };
  location?: string;
  books_count?: number;
  books?: HardcoverBook[];
}

// GraphQL query to fetch author by ID
const GET_AUTHOR_BY_ID_QUERY = `
  query GetAuthorById($id: Int!) {
    authors(where: {id: {_eq: $id}}) {
      id
      name
      bio
      cached_image
      image {
        url
      }
      location
      books_count
    }
  }
`;

// GraphQL query to fetch unique books by author using canonical relationships
const GET_BOOKS_BY_AUTHOR_QUERY = `
  query GetBooksByAuthor($authorId: Int!) {
    books(
      where: {
        contributions: {author_id: {_eq: $authorId}}, 
        canonical_id: {_is_null: true}
      }, 
      order_by: {users_count: desc}
    ) {
      id
      title
      subtitle
      description
      pages
      release_date
      slug
      users_count
      editions_count
      image {
        url
      }
    }
  }
`;

// Fetch a single author by ID
export async function getAuthorById(
  id: number
): Promise<HardcoverAuthor | null> {
  try {
    const data = await makeHardcoverRequest(GET_AUTHOR_BY_ID_QUERY, { id });

    if (!data.authors || data.authors.length === 0) {
      return null;
    }

    return data.authors[0] as HardcoverAuthor;
  } catch (error) {
    console.error(`Failed to fetch author ${id}:`, error);
    return null;
  }
}

// Fetch unique books by a specific author using canonical book relationships
export async function getBooksByAuthor(
  authorId: number
): Promise<HardcoverBook[]> {
  try {
    const data = await makeHardcoverRequest(GET_BOOKS_BY_AUTHOR_QUERY, {
      authorId,
    });
    return data.books as HardcoverBook[];
  } catch (error) {
    console.error(`Failed to fetch books for author ${authorId}:`, error);
    return [];
  }
}
