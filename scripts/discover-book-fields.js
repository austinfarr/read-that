// Script to discover what fields actually exist on books table
// Run with: HARDCOVER_API_TOKEN=your_token node scripts/discover-book-fields.js

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

async function discoverBookFields() {
  console.log("🔍 Discovering actual book fields...\n");

  // Get introspection for books type specifically
  const introspectionQuery = `
    query GetBooksType {
      __type(name: "books") {
        fields {
          name
          type {
            name
            kind
            ofType {
              name
              kind
            }
          }
        }
      }
    }
  `;
  
  const result = await makeRequest(introspectionQuery);
  
  if (result.data?.__type?.fields) {
    console.log("=== Available fields on 'books' table ===");
    const fields = result.data.__type.fields;
    
    fields.forEach(field => {
      const typeName = field.type.name || field.type.ofType?.name || field.type.kind;
      console.log(`- ${field.name}: ${typeName}`);
    });

    // Look for potentially useful fields for filtering
    console.log("\n=== Potentially useful fields for uniqueness ===");
    const usefulFields = fields.filter(field => 
      field.name.includes('canonical') ||
      field.name.includes('primary') ||
      field.name.includes('master') ||
      field.name.includes('parent') ||
      field.name.includes('original') ||
      field.name.includes('work') ||
      field.name.includes('edition') ||
      field.name.includes('language') ||
      field.name.includes('format') ||
      field.name.includes('type') ||
      field.name.includes('isbn') ||
      field.name.includes('featured') ||
      field.name.includes('priority')
    );

    if (usefulFields.length > 0) {
      usefulFields.forEach(field => {
        const typeName = field.type.name || field.type.ofType?.name || field.type.kind;
        console.log(`✅ ${field.name}: ${typeName}`);
      });
    } else {
      console.log("❌ No obvious uniqueness fields found");
    }
  } else {
    console.log("❌ Could not get books type information");
  }

  // Test a sample book with all potential filtering fields
  console.log("\n=== Testing sample book with discovered fields ===");
  
  // Get one Mistborn book to see actual structure
  const testQuery = `
    query TestBookStructure {
      books(where: {title: {_ilike: "%mistborn%"}}, limit: 1) {
        id
        title
        slug
        subtitle
        description
        pages
        release_date
        users_count
        cached_reading_now_count
        cached_want_to_read_count
        cached_have_read_count
        cached_rating
        tags
        language_id
        original_language_id
        content_warnings
        isbn
        isbn10
        isbn13
        oclc
        lccn
        asin
        created_at
        updated_at
        image {
          url
        }
        contributions {
          author {
            id
            name
          }
        }
      }
    }
  `;

  try {
    const testResult = await makeRequest(testQuery);
    
    if (testResult.data?.books?.[0]) {
      const book = testResult.data.books[0];
      console.log(`Sample book: "${book.title}"`);
      console.log("Available data:");
      
      Object.entries(book).forEach(([key, value]) => {
        if (value !== null && value !== undefined && key !== 'contributions' && key !== 'image') {
          console.log(`  ${key}: ${JSON.stringify(value).slice(0, 100)}${JSON.stringify(value).length > 100 ? '...' : ''}`);
        }
      });
    } else {
      console.log("❌ Could not get sample book:", testResult.errors);
    }
  } catch (error) {
    console.log("❌ Sample book test error:", error.message);
  }

  // Test language filtering approach
  console.log("\n=== Testing language-based filtering ===");
  
  try {
    const languageQuery = `
      query TestLanguageFiltering($authorId: Int!) {
        english_books: books(
          where: {
            contributions: {author_id: {_eq: $authorId}}, 
            _or: [
              {language_id: {_is_null: true}},
              {language_id: {_eq: 1}},
              {original_language_id: {_eq: 1}}
            ]
          }, 
          order_by: {users_count: desc}
        ) {
          id
          title
          language_id
          original_language_id
          users_count
        }
      }
    `;
    
    // Use James Islington again
    const searchResult = await makeRequest(`
      query SearchAuthor($query: String!) {
        search(query: $query, query_type: "Author", per_page: 1, page: 1) {
          results
        }
      }
    `, { query: "James Islington" });

    const authorId = searchResult.data?.search?.results?.hits?.[0]?.document?.id;
    
    if (authorId) {
      const result = await makeRequest(languageQuery, { authorId: parseInt(authorId) });
      
      if (result.data?.english_books) {
        console.log(`Found ${result.data.english_books.length} potentially English books:`);
        result.data.english_books.slice(0, 8).forEach((book, i) => {
          console.log(`${i + 1}. "${book.title}" (Lang: ${book.language_id}, OrigLang: ${book.original_language_id}, Users: ${book.users_count})`);
        });
      } else {
        console.log("❌ Language filtering failed:", result.errors);
      }
    }
  } catch (error) {
    console.log("❌ Language filtering error:", error.message);
  }
}

discoverBookFields().catch(console.error);