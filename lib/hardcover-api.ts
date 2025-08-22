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

// List information for the explore page
export interface ExploreList {
  id: number;
  name: string;
  description: string;
  books: HardcoverBook[];
  booksCount: number;
  likesCount: number;
  username: string;
}

export interface ExploreLists {
  lists: ExploreList[];
}

// Dynamic lists approach: Use popular community-curated lists
const GET_POPULAR_LISTS_QUERY = `
  query GetPopularLists($limit: Int!) {
    lists(
      where: {public: {_eq: true}, books_count: {_gt: 3}}
      order_by: {likes_count: desc}
      limit: $limit
    ) {
      id
      name
      description
      books_count
      likes_count
      user {
        username
      }
    }
  }
`;

const GET_LIST_BOOKS_QUERY = `
  query GetListBooks($listId: Int!, $limit: Int!) {
    lists(where: {id: {_eq: $listId}}) {
      name
      description
      list_books(limit: $limit) {
        book {
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
    }
  }
`;

// Fetch popular public lists
export async function getPopularLists(limit: number = 10): Promise<any[]> {
  try {
    const data = await makeHardcoverRequest(GET_POPULAR_LISTS_QUERY, { limit });
    return data.lists || [];
  } catch (error) {
    console.error("Failed to fetch popular lists:", error);
    return [];
  }
}

// Fetch books from a specific list
export async function getBooksFromList(listId: number, limit: number = 12): Promise<HardcoverBook[]> {
  try {
    const data = await makeHardcoverRequest(GET_LIST_BOOKS_QUERY, { listId, limit });
    const list = data.lists?.[0];
    if (!list || !list.list_books) return [];
    
    return list.list_books.map((item: any) => item.book) as HardcoverBook[];
  } catch (error) {
    console.error(`Failed to fetch books from list ${listId}:`, error);
    return [];
  }
}

// Fallback curated sets for reliability
const FALLBACK_TRENDING = [427578, 340654, 432761, 430111, 379753, 266607];
const FALLBACK_HIGHEST_RATED = [312460, 379760, 382700, 386446, 379217, 188628];
const FALLBACK_NEW_RELEASES = [427578, 266607, 432478, 435002, 428889, 427825];

// Fetch books by popularity (tries to use community lists first)
export async function getPopularBooks(limit: number = 12): Promise<HardcoverBook[]> {
  try {
    // Try to get books from popular community lists
    const lists = await getPopularLists(5);
    if (lists.length > 0) {
      // Use the most popular list
      const topList = lists[0];
      const books = await getBooksFromList(topList.id, limit);
      if (books.length > 0) return books;
    }
    
    // Fallback to curated set
    return await getBooksByIds(FALLBACK_TRENDING.slice(0, limit));
  } catch (error) {
    console.error("Failed to fetch popular books:", error);
    return await getBooksByIds(FALLBACK_TRENDING.slice(0, limit));
  }
}

// Fetch highest rated books (tries community lists)
export async function getHighestRatedBooks(limit: number = 12): Promise<HardcoverBook[]> {
  try {
    const lists = await getPopularLists(10);
    // Look for lists that might contain highly rated books
    const ratedList = lists.find(list => 
      list.name.toLowerCase().includes('best') || 
      list.name.toLowerCase().includes('top') ||
      list.name.toLowerCase().includes('favorite')
    );
    
    if (ratedList) {
      const books = await getBooksFromList(ratedList.id, limit);
      if (books.length > 0) return books;
    }
    
    return await getBooksByIds(FALLBACK_HIGHEST_RATED.slice(0, limit));
  } catch (error) {
    console.error("Failed to fetch highest rated books:", error);
    return await getBooksByIds(FALLBACK_HIGHEST_RATED.slice(0, limit));
  }
}

// Fetch new releases (tries community lists)
export async function getNewReleases(limit: number = 12): Promise<HardcoverBook[]> {
  try {
    const lists = await getPopularLists(10);
    // Look for lists about new/recent books
    const newList = lists.find(list => 
      list.name.toLowerCase().includes('new') || 
      list.name.toLowerCase().includes('recent') ||
      list.name.toLowerCase().includes('2024') ||
      list.name.toLowerCase().includes('2023')
    );
    
    if (newList) {
      const books = await getBooksFromList(newList.id, limit);
      if (books.length > 0) return books;
    }
    
    return await getBooksByIds(FALLBACK_NEW_RELEASES.slice(0, limit));
  } catch (error) {
    console.error("Failed to fetch new releases:", error);
    return await getBooksByIds(FALLBACK_NEW_RELEASES.slice(0, limit));
  }
}

// Handpicked community lists for the explore page
const FEATURED_LISTS = [
  {
    id: 83230,
    name: "100 New York Times Best Books of the 21st Century",
    description: "As voted on by 503 novelists, nonfiction writers, poets, critics and other book lovers — with a little help from the staff of The New York Times Book Review.",
    category: "Editor's Choice"
  },
  {
    id: 3,
    name: "NPR Top 100 Science Fiction Fantasy",
    description: "More than 60,000 ballots were cast in NPR's annual summer reader's survey. These are the top 100 winners - ordered by the number of votes they received.",
    category: "Sci-Fi & Fantasy"
  },
  {
    id: 83400,
    name: "The Esquire 75 Best Sci-Fi Books of All Time",
    description: "Science fiction brings out the best in our imaginations and evokes a sense of wonder, but it also inspires a spirit of questioning.",
    category: "Sci-Fi & Fantasy"
  },
  {
    id: 108,
    name: "The 31 Best Fantasy Books Everyone Should Read",
    description: "WIRED's team has summoned some of the strangest creatures in the most fantastic worlds in this list of the best fantasy books everyone should read.",
    category: "Fantasy"
  },
  {
    id: 102,
    name: "The 100 Best Fantasy Books of All Time by Time Magazine",
    description: "Time Magazine called upon top fantasy authors to collect the most influential works of fantasy fiction in chronological order.",
    category: "Fantasy"
  },
  {
    id: 96,
    name: "Pulitzer Prize-winning Fiction",
    description: "This list contains Pulitzer Prize-winning fiction since the Fiction Prize's inception in 1948.",
    category: "Literary Awards"
  },
  {
    id: 20632,
    name: "The Book You Saw on TikTok",
    description: "Trending books from BookTok that are taking social media by storm.",
    category: "Trending"
  },
  {
    id: 106,
    name: "Top 25 Books to Unleash Your Creative Potential",
    description: "Creativity can flourish if fed by curiosity, self-motivation, and a thirst for knowledge.",
    category: "Self-Development"
  },
  {
    id: 104,
    name: "Ten Best Non-Fiction Science Books to Read Right Now",
    description: "From Einstein's quantum theory to human evolution and beyond—this list includes science books that tap into a universe of knowledge.",
    category: "Science"
  },
  {
    id: 145941,
    name: "Hugo Award Best Novel Nominees and Winners",
    description: "Spanning generations, this list compiles all of the Nominees and winners from the inaugural 1953 presentation of The Hugo Award to the present.",
    category: "Literary Awards"
  }
];

// Fetch books for multiple lists efficiently
export async function getExploreLists(): Promise<ExploreLists> {
  try {
    // Fetch books for each featured list
    const listPromises = FEATURED_LISTS.map(async (listInfo) => {
      try {
        const books = await getBooksFromList(listInfo.id, 12);
        return {
          id: listInfo.id,
          name: listInfo.name,
          description: listInfo.description,
          books: books,
          booksCount: books.length,
          likesCount: 0, // We know the actual likes from the data above but simplifying for now
          username: "hardcover", // Most are from hardcover user
        };
      } catch (error) {
        console.error(`Failed to fetch list ${listInfo.id}:`, error);
        return null;
      }
    });

    const results = await Promise.allSettled(listPromises);
    const successfulLists = results
      .filter((result): result is PromiseFulfilledResult<ExploreList> => 
        result.status === 'fulfilled' && result.value !== null
      )
      .map(result => result.value);

    return {
      lists: successfulLists
    };
  } catch (error) {
    console.error("Failed to fetch explore lists:", error);
    return {
      lists: []
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
