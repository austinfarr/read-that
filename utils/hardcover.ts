// Utility functions for fetching data from Hardcover API

export const GET_BOOKS_BY_IDS_QUERY = `
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

export async function getBooksByIds(ids: string[]): Promise<any[]> {
  if (ids.length === 0) return [];

  const numericIds = ids.map((id) => parseInt(id)).filter((id) => !isNaN(id));
  if (numericIds.length === 0) return [];

  try {
    const response = await fetch("/api/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: GET_BOOKS_BY_IDS_QUERY,
        variables: { ids: numericIds },
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch books");
    }

    const { data } = await response.json();
    return data?.books || [];
  } catch (error) {
    console.error("Error fetching books from Hardcover:", error);
    return [];
  }
}

// Convert Hardcover book data to our Book type
export function hardcoverToBook(hardcoverBook: any) {
  return {
    id: hardcoverBook.id.toString(),
    title: hardcoverBook.title || "Unknown Title",
    author: hardcoverBook.contributions?.[0]?.author?.name || "Unknown Author",
    coverUrl: hardcoverBook.image?.url || "",
    description: hardcoverBook.description,
    pageCount: hardcoverBook.pages,
    publicationYear: hardcoverBook.release_date
      ? new Date(hardcoverBook.release_date).getFullYear()
      : null,
  };
}
