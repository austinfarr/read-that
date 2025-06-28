// Script to test different search query types
// Run with: HARDCOVER_API_TOKEN=your_token node scripts/test-search-types.js

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

async function testSearchTypes() {
  console.log("🔍 Testing different search query types...\n");

  const searchQuery = "Brandon Sanderson";
  
  const queryTypes = [
    "Title",
    "Author", 
    "All",
    "Book",
    "Person",
    "",  // Empty string
    null // No query_type parameter
  ];

  for (const queryType of queryTypes) {
    console.log(`\n=== Testing query_type: "${queryType}" ===`);
    
    let query;
    let variables;
    
    if (queryType === null) {
      // Test without query_type parameter
      query = `
        query SearchTest($query: String!) {
          search(query: $query, per_page: 3, page: 1) {
            results
          }
        }
      `;
      variables = { query: searchQuery };
    } else {
      query = `
        query SearchTest($query: String!, $queryType: String!) {
          search(query: $query, query_type: $queryType, per_page: 3, page: 1) {
            results
          }
        }
      `;
      variables = { query: searchQuery, queryType: queryType };
    }

    try {
      const result = await makeRequest(query, variables);
      
      if (result.errors) {
        console.log("❌ Error:", result.errors[0]?.message);
      } else if (result.data?.search?.results?.hits) {
        const hits = result.data.search.results.hits;
        console.log(`✅ Found ${hits.length} results:`);
        
        hits.forEach((hit, index) => {
          const doc = hit.document;
          console.log(`  ${index + 1}. ID: ${doc.id}, Name/Title: "${doc.title || doc.name}", Type: ${doc.books ? 'Author' : 'Book'}`);
          if (doc.author_names) {
            console.log(`      Authors: ${doc.author_names.join(', ')}`);
          }
          if (doc.books_count) {
            console.log(`      Book Count: ${doc.books_count}`);
          }
        });
      } else {
        console.log("❌ No results or unexpected format");
        console.log("Response:", JSON.stringify(result, null, 2));
      }
    } catch (error) {
      console.log("❌ Request failed:", error.message);
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Test mixed search (both books and authors)
  console.log(`\n=== Testing combined search (books + authors) ===`);
  
  try {
    const titleSearch = await makeRequest(`
      query SearchTitle($query: String!) {
        search(query: $query, query_type: "Title", per_page: 2, page: 1) {
          results
        }
      }
    `, { query: searchQuery });

    const authorSearch = await makeRequest(`
      query SearchAuthor($query: String!) {
        search(query: $query, query_type: "Author", per_page: 2, page: 1) {
          results
        }
      }
    `, { query: searchQuery });

    console.log("Title search results:", titleSearch.data?.search?.results?.hits?.length || 0);
    console.log("Author search results:", authorSearch.data?.search?.results?.hits?.length || 0);
    
    if (authorSearch.data?.search?.results?.hits?.length > 0) {
      console.log("Author result example:", JSON.stringify(authorSearch.data.search.results.hits[0], null, 2));
    }
    
  } catch (error) {
    console.log("❌ Combined search failed:", error.message);
  }
}

testSearchTypes().catch(console.error);