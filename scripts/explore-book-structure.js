// Script to explore Hardcover API schema for books vs editions
// Run with: HARDCOVER_API_TOKEN=your_token node scripts/explore-book-structure.js

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

async function exploreBookStructure() {
  console.log("🔍 Exploring Hardcover API book/edition structure...\n");

  // 1. Look for other tables that might represent unique books
  console.log("=== Testing introspection for book-related types ===");
  
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
  
  const result = await makeRequest(introspectionQuery);
  const types = result.data?.__schema?.types || [];
  
  // Look for types that might be related to books
  const bookRelatedTypes = types.filter(type => 
    type.name?.toLowerCase().includes('book') || 
    type.name?.toLowerCase().includes('edition') ||
    type.name?.toLowerCase().includes('work') ||
    type.name?.toLowerCase().includes('title')
  );

  console.log("Book-related types found:");
  bookRelatedTypes.forEach(type => {
    console.log(`- ${type.name} (${type.kind})`);
    if (type.fields && type.fields.length < 15) { // Don't spam for large types
      type.fields.forEach(field => {
        console.log(`  - ${field.name}: ${field.type.name || field.type.kind}`);
      });
    }
  });

  // 2. Test if there's a canonical book or work table
  console.log("\n=== Testing potential work/canonical book tables ===");
  
  const testQueries = [
    {
      name: "works table",
      query: `query { works(limit: 1) { id title } }`
    },
    {
      name: "canonical_books table", 
      query: `query { canonical_books(limit: 1) { id title } }`
    },
    {
      name: "book_works table",
      query: `query { book_works(limit: 1) { id title } }`
    },
    {
      name: "titles table",
      query: `query { titles(limit: 1) { id name } }`
    }
  ];

  for (const test of testQueries) {
    try {
      const result = await makeRequest(test.query);
      if (result.data && !result.errors) {
        console.log(`✅ ${test.name} exists!`);
        console.log("Sample:", JSON.stringify(result.data, null, 2));
      } else {
        console.log(`❌ ${test.name} - ${result.errors?.[0]?.message || 'Not found'}`);
      }
    } catch (error) {
      console.log(`❌ ${test.name} - Error: ${error.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  // 3. Examine the books table structure more closely
  console.log("\n=== Examining books table fields ===");
  
  const booksType = types.find(type => type.name === 'books');
  if (booksType && booksType.fields) {
    console.log("Books table fields:");
    booksType.fields.forEach(field => {
      console.log(`- ${field.name}: ${field.type.name || field.type.kind}`);
    });

    // Look for fields that might indicate canonical/parent relationships
    const canonicalFields = booksType.fields.filter(field => 
      field.name.includes('canonical') || 
      field.name.includes('parent') ||
      field.name.includes('work') ||
      field.name.includes('master') ||
      field.name.includes('primary')
    );

    if (canonicalFields.length > 0) {
      console.log("\nPotential canonical/parent fields:");
      canonicalFields.forEach(field => {
        console.log(`- ${field.name}: ${field.type.name || field.type.kind}`);
      });
    }
  }

  // 4. Test a specific book to see its structure
  console.log("\n=== Testing book structure with known book ===");
  
  try {
    const bookQuery = `
      query TestBookStructure {
        books(where: {title: {_ilike: "%mistborn%"}}, limit: 3) {
          id
          title
          canonical_id
          canonical {
            id
            title
          }
          parent_id
          work_id
          master_id
          primary_id
          original_id
        }
      }
    `;
    
    const result = await makeRequest(bookQuery);
    if (result.data && result.data.books) {
      console.log("Books with potential canonical fields:");
      result.data.books.forEach((book, i) => {
        console.log(`${i + 1}. "${book.title}" (ID: ${book.id})`);
        Object.entries(book).forEach(([key, value]) => {
          if (key !== 'title' && key !== 'id' && value !== null && value !== undefined) {
            console.log(`   ${key}: ${JSON.stringify(value)}`);
          }
        });
      });
    } else {
      console.log("❌ Could not test book structure:", result.errors?.[0]?.message);
    }
  } catch (error) {
    console.log("❌ Book structure test failed:", error.message);
  }

  // 5. Check if there's a way to filter by language or region
  console.log("\n=== Testing language/region filtering ===");
  
  try {
    const languageQuery = `
      query TestLanguageFilter {
        books(where: {title: {_ilike: "%sanderson%"}}, limit: 5) {
          id
          title
          language
          language_id
          region
          country
          locale
          original_language
        }
      }
    `;
    
    const result = await makeRequest(languageQuery);
    if (result.data && result.data.books) {
      console.log("Books with language fields:");
      result.data.books.forEach((book, i) => {
        console.log(`${i + 1}. "${book.title}"`);
        Object.entries(book).forEach(([key, value]) => {
          if (key !== 'title' && value !== null && value !== undefined) {
            console.log(`   ${key}: ${value}`);
          }
        });
      });
    } else {
      console.log("❌ Language filter test failed:", result.errors?.[0]?.message);
    }
  } catch (error) {
    console.log("❌ Language test failed:", error.message);
  }
}

exploreBookStructure().catch(console.error);