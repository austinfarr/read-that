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

// Fetch popular/recommended books for the explore page
export async function getExploreBooks(): Promise<HardcoverBook[]> {
  // Popular sci-fi/fantasy book IDs from Hardcover
  // These are verified book IDs from actual Hardcover searches
  const recommendedBookIds = [
    312460, // Dune by Frank Herbert (using the main edition instead of the collection)
    369692, // Mistborn: The Final Empire by Brandon Sanderson
    427578, // Project Hail Mary by Andy Weir
    188628, // Foundation by Isaac Asimov
    379217, // The Name of the Wind by Patrick Rothfuss
    292354, // The Martian by Andy Weir
  ];

  try {
    const books = await getBooksByIds(recommendedBookIds);

    // If we don't get enough books, return fallback data
    if (books.length < 3) {
      console.warn("Not enough books from API, using fallback data");
      return getFallbackBooks();
    }

    return books;
  } catch (error) {
    console.error("Failed to fetch explore books, using fallback:", error);
    return getFallbackBooks();
  }
}

// Fallback book data in case API fails
function getFallbackBooks(): HardcoverBook[] {
  return [];
  // return [
  //   {
  //     id: "fallback-1",
  //     title: "Mistborn: The Final Empire",
  //     subtitle: "Book One of Mistborn",
  //     description:
  //       "In a world where ash falls from the sky, and mist dominates the night, an unlikely hero must learn to use the magic of Allomancy to defeat an immortal emperor who has reigned for a thousand years.",
  //     pages: 541,
  //     release_date: "2006-07-17",
  //     slug: "mistborn-the-final-empire",
  //     image: {
  //       url: "https://m.media-amazon.com/images/I/91U6rc7u0yL._AC_UF1000,1000_QL80_.jpg",
  //     },
  //     contributions: [
  //       {
  //         author: {
  //           name: "Brandon Sanderson",
  //         },
  //       },
  //     ],
  //   },
  //   {
  //     id: "fallback-2",
  //     title: "Project Hail Mary",
  //     description:
  //       "A lone astronaut must save the earth from disaster in this science fiction thriller. Ryland Grace wakes up on a spaceship with no memory of why he's there, discovering he might be humanity's last hope.",
  //     pages: 496,
  //     release_date: "2021-05-04",
  //     slug: "project-hail-mary",
  //     image: {
  //       url: "https://mpd-biblio-covers.imgix.net/9781429961813.jpg",
  //     },
  //     contributions: [
  //       {
  //         author: {
  //           name: "Andy Weir",
  //         },
  //       },
  //     ],
  //   },
  //   {
  //     id: "fallback-3",
  //     title: "Dune",
  //     description:
  //       "Set on the desert planet Arrakis, this epic follows Paul Atreides as he becomes embroiled in a struggle for control of the universe's most valuable substance - the spice melange.",
  //     pages: 688,
  //     release_date: "1965-10-01",
  //     slug: "dune",
  //     image: {
  //       url: "https://m.media-amazon.com/images/I/81TmnPZWb0L.jpg",
  //     },
  //     contributions: [
  //       {
  //         author: {
  //           name: "Frank Herbert",
  //         },
  //       },
  //     ],
  //   },
  //   // {
  //   //   id: "fallback-4",
  //   //   title: "Foundation",
  //   //   description: "For twelve thousand years the Galactic Empire has ruled supreme. Now it is dying. But only Hari Seldon, creator of the revolutionary science of psychohistory, can see into the future.",
  //   //   pages: 244,
  //   //   release_date: "1951-06-01",
  //   //   slug: "foundation",
  //   //   image: {
  //   //     url: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1417900846i/29579.jpg"
  //   //   },
  //   //   contributions: [
  //   //     {
  //   //       author: {
  //   //         name: "Isaac Asimov"
  //   //       }
  //   //     }
  //   //   ]
  //   // },
  //   {
  //     id: "fallback-5",
  //     title: "The Name of the Wind",
  //     subtitle: "The Kingkiller Chronicle: Day One",
  //     description:
  //       "Told in Kvothe's own voice, this is the tale of the magically gifted young man who grows to be the most notorious wizard his world has ever seen.",
  //     pages: 662,
  //     release_date: "2007-03-27",
  //     slug: "the-name-of-the-wind",
  //     image: {
  //       url: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1270352123i/186074.jpg",
  //     },
  //     contributions: [
  //       {
  //         author: {
  //           name: "Patrick Rothfuss",
  //         },
  //       },
  //     ],
  //   },
  //   {
  //     id: "fallback-6",
  //     title: "The Martian",
  //     description:
  //       "Six days ago, astronaut Mark Watney became one of the first people to walk on Mars. Now, he's sure he'll be the first person to die there.",
  //     pages: 369,
  //     release_date: "2011-09-27",
  //     slug: "the-martian",
  //     image: {
  //       url: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1413706054i/18007564.jpg",
  //     },
  //     contributions: [
  //       {
  //         author: {
  //           name: "Andy Weir",
  //         },
  //       },
  //     ],
  //   },
  // ];
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
