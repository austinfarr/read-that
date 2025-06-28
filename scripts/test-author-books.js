// Script to explore how to filter author books to unique titles
// Run with: HARDCOVER_API_TOKEN=your_token node scripts/test-author-books.js

const HARDCOVER_API_URL = "https://api.hardcover.app/v1/graphql";

async function makeRequest(query, variables = {}) {
  const response = await fetch(HARDCOVER_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.HARDCOVER_API_TOKEN}`,
      "User-Agent": "ReadThat-App/1.0",
    },
    body: JSON.stringify({ query, variables }),
  });

  const data = await response.json();
  return data;
}

async function testAuthorBooks() {
  console.log("🔍 Testing author books filtering...\n");

  // Test with James Islington (author ID we can find via search)
  console.log("=== Finding James Islington ===");
  
  const searchResult = await makeRequest(`
    query SearchAuthor($query: String!) {
      search(query: $query, query_type: "Author", per_page: 1, page: 1) {
        results
      }
    }
  `, { query: "James Islington" });

  const authorId = searchResult.data?.search?.results?.hits?.[0]?.document?.id;
  console.log("Author ID:", authorId);

  if (!authorId) {
    console.log("❌ Could not find author");
    return;
  }

  // Test 1: Current query (all books)
  console.log("\n=== Current Query (All Books) ===");
  const allBooksResult = await makeRequest(`
    query GetAllBooksByAuthor($authorId: Int!) {
      books(where: {contributions: {author_id: {_eq: $authorId}}}, order_by: {release_date: desc}) {
        id
        title
        subtitle
        release_date
        pages
        slug
        image {
          url
        }
      }
    }
  `, { authorId: parseInt(authorId) });

  const allBooks = allBooksResult.data?.books || [];
  console.log(`Found ${allBooks.length} total books/editions`);
  
  // Show first 10 titles to see the pattern
  console.log("Sample titles:");
  allBooks.slice(0, 10).forEach((book, i) => {
    console.log(`  ${i + 1}. "${book.title}" ${book.subtitle ? `(${book.subtitle})` : ''}`);
  });

  // Test 2: Try to find unique books by grouping similar titles
  console.log("\n=== Analyzing Title Patterns ===");
  const titleGroups = {};
  
  allBooks.forEach(book => {
    // Create a normalized title for grouping
    let baseTitle = book.title
      .toLowerCase()
      .replace(/[:\-–—]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Remove common edition indicators
    baseTitle = baseTitle
      .replace(/\b(audiobook|audio book|kindle|ebook|e-book|hardcover|paperback|mass market)\b/g, '')
      .replace(/\b(edition|ed\.?)\b/g, '')
      .replace(/\b(volume|vol\.?|book|bk\.?)\s*\d+/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!titleGroups[baseTitle]) {
      titleGroups[baseTitle] = [];
    }
    titleGroups[baseTitle].push(book);
  });

  console.log(`Grouped into ${Object.keys(titleGroups).length} unique titles:`);
  Object.entries(titleGroups).slice(0, 8).forEach(([baseTitle, books]) => {
    console.log(`  "${baseTitle}" - ${books.length} edition(s)`);
    if (books.length > 1) {
      books.slice(0, 3).forEach(book => {
        console.log(`    - "${book.title}"`);
      });
    }
  });

  // Test 3: Try filtering by specific criteria
  console.log("\n=== Attempting Smart Filtering ===");
  
  // Get one book per unique base title, preferring books with covers and pages
  const uniqueBooks = [];
  
  Object.values(titleGroups).forEach(books => {
    // Sort by preference: has image, has pages, most recent
    const sorted = books.sort((a, b) => {
      // Prefer books with images
      if (!!a.image?.url !== !!b.image?.url) {
        return !!b.image?.url ? 1 : -1;
      }
      
      // Prefer books with page counts
      if (!!a.pages !== !!b.pages) {
        return !!b.pages ? 1 : -1;
      }
      
      // Prefer more recent if we have dates
      if (a.release_date && b.release_date) {
        return new Date(b.release_date) - new Date(a.release_date);
      }
      
      return 0;
    });
    
    uniqueBooks.push(sorted[0]);
  });

  console.log(`\nFiltered to ${uniqueBooks.length} unique books:`);
  uniqueBooks.slice(0, 8).forEach((book, i) => {
    console.log(`  ${i + 1}. "${book.title}"`);
    console.log(`     Cover: ${book.image?.url ? 'Yes' : 'No'}, Pages: ${book.pages || 'Unknown'}`);
  });

  // Test 4: Check if there are any API-level filtering options
  console.log("\n=== Testing API Filtering Options ===");
  
  // Try different order_by and filtering approaches
  const testQueries = [
    {
      name: "Order by popularity",
      query: `
        query TestPopular($authorId: Int!) {
          books(where: {contributions: {author_id: {_eq: $authorId}}}, order_by: {users_count: desc}, limit: 10) {
            id
            title
            users_count
          }
        }
      `
    },
    {
      name: "Filter by having pages",
      query: `
        query TestWithPages($authorId: Int!) {
          books(where: {contributions: {author_id: {_eq: $authorId}}, pages: {_is_null: false}}, order_by: {release_date: desc}, limit: 10) {
            id
            title
            pages
          }
        }
      `
    },
    {
      name: "Filter by having image",
      query: `
        query TestWithImage($authorId: Int!) {
          books(where: {contributions: {author_id: {_eq: $authorId}}, image_id: {_is_null: false}}, order_by: {release_date: desc}, limit: 10) {
            id
            title
            image {
              url
            }
          }
        }
      `
    }
  ];

  for (const test of testQueries) {
    try {
      const result = await makeRequest(test.query, { authorId: parseInt(authorId) });
      const books = result.data?.books || [];
      console.log(`${test.name}: ${books.length} results`);
    } catch (error) {
      console.log(`${test.name}: Error - ${error.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 200));
  }
}

testAuthorBooks().catch(console.error);