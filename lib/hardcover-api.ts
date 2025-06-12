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
  const response = await fetch(HARDCOVER_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${process.env.HARDCOVER_API_TOKEN}`,
      "User-Agent": "ReadThat-App/1.0", // Good practice as mentioned in docs
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (!response.ok) {
    throw new Error(`Hardcover API request failed: ${response.statusText}`);
  }

  const data = await response.json();

  if (data.errors) {
    console.error("Hardcover API GraphQL errors:", data.errors);
    throw new Error("GraphQL query failed");
  }

  return data.data;
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
  sciFiFantasy: HardcoverBook[];
  classicLiterature: HardcoverBook[];
  modernFiction: HardcoverBook[];
}

// Fetch popular/recommended books for the explore page
export async function getExploreBooks(): Promise<CategorizedBooks> {
  // Popular sci-fi/fantasy book IDs from Hardcover
  // These are verified book IDs from actual Hardcover searches
  const sciFiFantasyIds = [
    312460, // Dune by Frank Herbert
    369692, // Mistborn: The Final Empire by Brandon Sanderson
    427578, // Project Hail Mary by Andy Weir
    188628, // Foundation by Isaac Asimov
    379217, // The Name of the Wind by Patrick Rothfuss
    292354, // The Martian by Andy Weir
    382700, // The Hobbit by J.R.R. Tolkien
    158268, // Ender's Game by Orson Scott Card
    386446, // The Way of Kings by Brandon Sanderson
    313448, // Neuromancer by William Gibson
    427825, // The Fifth Season by N.K. Jemisin
  ];

  const classicLiteratureIds = [
    379760, // 1984 by George Orwell
    374328, // Brave New World by Aldous Huxley
    377842, // The Left Hand of Darkness by Ursula K. Le Guin
  ];

  const modernFictionIds = [
    26363, // Ready Player One by Ernest Cline
    266607, // Klara and the Sun by Kazuo Ishiguro
    340654, // The Seven Husbands of Evelyn Hugo by Taylor Jenkins Reid
  ];

  try {
    // Fetch each category separately
    const [sciFiFantasyBooks, classicBooks, modernFictionBooks] =
      await Promise.all([
        getBooksByIds(sciFiFantasyIds),
        getBooksByIds(classicLiteratureIds),
        getBooksByIds(modernFictionIds),
      ]);

    return {
      sciFiFantasy: sciFiFantasyBooks,
      classicLiterature: classicBooks,
      modernFiction: modernFictionBooks,
    };
  } catch (error) {
    console.error("Failed to fetch explore books, using fallback:", error);
    return {
      sciFiFantasy: [],
      classicLiterature: [],
      modernFiction: [],
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
