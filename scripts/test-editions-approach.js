// Script to test using editions table or book relationships
// Run with: HARDCOVER_API_TOKEN=your_token node scripts/test-editions-approach.js

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

async function testEditionsApproach() {
  console.log("🔍 Testing editions vs books approach...\n");

  // Find James Islington again
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

  // Test 1: Look at book structure more carefully
  console.log("\n=== Testing book relationships ===");
  
  try {
    const bookStructureQuery = `
      query TestBookRelations($authorId: Int!) {
        books(where: {contributions: {author_id: {_eq: $authorId}}}, limit: 5) {
          id
          title
          canonical_id
          parent_book_id
          master_id
          edition_id
          work_id
          primary
          primary_book
          is_primary
          edition_type
          format
          language
          country_code
          isbn
          isbn10
          isbn13
        }
      }
    `;
    
    const result = await makeRequest(bookStructureQuery, { authorId: parseInt(authorId) });
    
    if (result.data && result.data.books) {
      console.log("Book relationship fields found:");
      result.data.books.forEach((book, i) => {
        console.log(`${i + 1}. "${book.title}"`);
        Object.entries(book).forEach(([key, value]) => {
          if (key !== 'title' && value !== null && value !== undefined) {
            console.log(`   ${key}: ${value}`);
          }
        });
        console.log();
      });
    } else {
      console.log("❌ Book relationship test failed:", result.errors);
    }
  } catch (error) {
    console.log("❌ Book structure test error:", error.message);
  }

  // Test 2: Try the editions table
  console.log("\n=== Testing editions table ===");
  
  try {
    const editionsQuery = `
      query TestEditions {
        editions(limit: 3) {
          id
          title
          book_id
          book {
            id
            title
          }
          format
          language
          isbn
        }
      }
    `;
    
    const result = await makeRequest(editionsQuery);
    
    if (result.data && result.data.editions) {
      console.log("✅ Editions table exists!");
      console.log("Sample editions:");
      result.data.editions.forEach((edition, i) => {
        console.log(`${i + 1}. Edition "${edition.title}" -> Book "${edition.book?.title}"`);
        console.log(`   Book ID: ${edition.book_id}, Format: ${edition.format}, Language: ${edition.language}`);
      });
    } else {
      console.log("❌ Editions test failed:", result.errors);
    }
  } catch (error) {
    console.log("❌ Editions test error:", error.message);
  }

  // Test 3: Try to get unique books via editions relationship
  console.log("\n=== Testing unique books via editions ===");
  
  try {
    const uniqueBooksQuery = `
      query GetUniqueBooksViaEditions($authorId: Int!) {
        books(
          where: {
            contributions: {author_id: {_eq: $authorId}}, 
            editions: {}
          }, 
          distinct_on: [canonical_id], 
          order_by: [{canonical_id: asc}, {users_count: desc}]
        ) {
          id
          title
          canonical_id
          users_count
          image {
            url
          }
          editions_aggregate {
            aggregate {
              count
            }
          }
        }
      }
    `;
    
    const result = await makeRequest(uniqueBooksQuery, { authorId: parseInt(authorId) });
    
    if (result.data && result.data.books) {
      console.log(`✅ Found ${result.data.books.length} unique books using distinct_on:`);
      result.data.books.forEach((book, i) => {
        console.log(`${i + 1}. "${book.title}" (Canonical: ${book.canonical_id}, Users: ${book.users_count}, Editions: ${book.editions_aggregate?.aggregate?.count || 'N/A'})`);
      });
    } else {
      console.log("❌ Unique books test failed:", result.errors);
    }
  } catch (error) {
    console.log("❌ Unique books test error:", error.message);
  }

  // Test 4: Try to find primary editions only
  console.log("\n=== Testing primary/featured books ===");
  
  try {
    const primaryBooksQuery = `
      query GetPrimaryBooks($authorId: Int!) {
        books(
          where: {
            contributions: {author_id: {_eq: $authorId}}, 
            _or: [
              {primary: {_eq: true}},
              {is_primary: {_eq: true}},
              {featured: {_eq: true}}
            ]
          }
        ) {
          id
          title
          primary
          is_primary
          featured
          users_count
        }
      }
    `;
    
    const result = await makeRequest(primaryBooksQuery, { authorId: parseInt(authorId) });
    
    if (result.data && result.data.books) {
      console.log(`Found ${result.data.books.length} primary/featured books:`);
      result.data.books.forEach((book, i) => {
        console.log(`${i + 1}. "${book.title}" (Primary: ${book.primary}, IsPrimary: ${book.is_primary}, Featured: ${book.featured})`);
      });
    } else {
      console.log("❌ Primary books test failed:", result.errors);
    }
  } catch (error) {
    console.log("❌ Primary books test error:", error.message);
  }
}

testEditionsApproach().catch(console.error);