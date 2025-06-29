// Script to explore Hardcover API schema and test queries
// Run with: HARDCOVER_API_TOKEN=your_token node scripts/explore-hardcover-api.js

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

// Test queries to understand the API
async function exploreAPI() {
  console.log("🔍 Exploring Hardcover API...\n");

  // 1. Try introspection query
  console.log("1. Testing introspection query...");
  const introspectionQuery = `
    query IntrospectionQuery {
      __schema {
        types {
          name
          kind
          fields {
            name
            type {
              name
              kind
            }
          }
        }
      }
    }
  `;
  
  let result = await makeRequest(introspectionQuery);
  if (result.data?.__schema) {
    console.log("✅ Introspection available!");
    const authorType = result.data.__schema.types.find(t => t.name === 'authors');
    if (authorType) {
      console.log("\nAuthor fields:");
      authorType.fields?.forEach(field => {
        console.log(`  - ${field.name} (${field.type.name || field.type.kind})`);
      });
    }
  } else {
    console.log("❌ Introspection not available");
  }

  // 2. Test a simple author query
  console.log("\n2. Testing simple author query...");
  const authorQuery = `
    query TestAuthor {
      authors(limit: 1) {
        id
        name
      }
    }
  `;
  
  result = await makeRequest(authorQuery);
  console.log("Author query result:", JSON.stringify(result, null, 2));

  // 3. Test author with more fields
  console.log("\n3. Testing author with additional fields...");
  const detailedAuthorQuery = `
    query TestAuthorDetailed {
      authors(where: {id: {_eq: 204214}}, limit: 1) {
        id
        name
        bio
        cached_image {
          url
          color
        }
        image {
          url
          color
        }
        born_date
        death_date
        location
        books_count
      }
    }
  `;
  
  result = await makeRequest(detailedAuthorQuery);
  console.log("Detailed author result:", JSON.stringify(result, null, 2));

  // 4. Test author with contributions (books)
  console.log("\n4. Testing author with contributions...");
  const authorWithContributionsQuery = `
    query TestAuthorWithContributions {
      authors(where: {id: {_eq: 204214}}, limit: 1) {
        id
        name
        contributions(limit: 5, order_by: {book: {release_date: desc}}) {
          id
          book_id
          author_id
          book {
            id
            title
            release_date
            image {
              url
            }
          }
        }
      }
    }
  `;
  
  result = await makeRequest(authorWithContributionsQuery);
  console.log("Author with contributions result:", JSON.stringify(result, null, 2));

  // 5. Test books by author using contributions
  console.log(`\n5. Testing books by author ID 204214...`);
  const booksByAuthorQuery = `
    query TestBooksByAuthor($authorId: Int!) {
      books(where: {contributions: {author_id: {_eq: $authorId}}}, limit: 5, order_by: {release_date: desc}) {
        id
        title
        release_date
        image {
          url
        }
      }
    }
  `;
  
  result = await makeRequest(booksByAuthorQuery, { authorId: 204214 });
  console.log("Books by author result:", JSON.stringify(result, null, 2));

  // 6. Test getting multiple authors
  console.log("\n6. Testing multiple authors query...");
  const multipleAuthorsQuery = `
    query TestMultipleAuthors {
      authors(where: {id: {_in: [204214, 206317, 207572]}}) {
        id
        name
        cached_image {
          url
        }
        books_count
      }
    }
  `;
  
  result = await makeRequest(multipleAuthorsQuery);
  console.log("Multiple authors result:", JSON.stringify(result, null, 2));

  // 7. Test search for authors
  console.log("\n7. Testing search for authors...");
  const searchQuery = `
    query SearchAuthors($query: String!) {
      search(query: $query, query_type: "Author", per_page: 3, page: 1) {
        results
      }
    }
  `;
  
  result = await makeRequest(searchQuery, { query: "Brandon Sanderson" });
  console.log("Author search result (first hit only):", JSON.stringify(result.data?.search?.results?.hits?.[0], null, 2));
}

exploreAPI().catch(console.error);