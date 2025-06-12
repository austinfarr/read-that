// Script to find Hardcover book IDs for popular books
// Run with: HARDCOVER_API_TOKEN=your_token node scripts/find-book-ids.js

const HARDCOVER_API_URL = "https://api.hardcover.app/v1/graphql";

const SEARCH_QUERY = `
  query SearchBooks($query: String!) {
    search(query: $query, query_type: "Title", per_page: 3, page: 1) {
      results
    }
  }
`;

async function searchBook(title) {
  try {
    console.log(`Searching for: "${title}"`);
    
    const response = await fetch(HARDCOVER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "authorization": `Bearer ${process.env.HARDCOVER_API_TOKEN}`,
        "User-Agent": "ReadThat-App/1.0",
      },
      body: JSON.stringify({
        query: SEARCH_QUERY,
        variables: { query: title },
      }),
    });

    if (!response.ok) {
      console.error(`HTTP error for "${title}": ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    
    if (data.errors) {
      console.error(`Error searching for "${title}":`, data.errors);
      return null;
    }

    const hits = data.data?.search?.results?.hits || [];
    
    if (hits.length > 0) {
      // Show multiple results for better selection
      console.log(`\nResults for "${title}":`);
      hits.slice(0, 3).forEach((hit, index) => {
        const book = hit.document;
        console.log(`  ${index + 1}. ID: ${book.id}, Title: "${book.title}", Author: ${book.author_names?.[0] || 'Unknown'}`);
      });
      
      const book = hits[0].document;
      console.log(`✅ Selected: "${book.title}" (ID: ${book.id})\n`);
      return book.id;
    } else {
      console.log(`No results found for "${title}"`);
      return null;
    }
  } catch (error) {
    console.error(`Failed to search for "${title}":`, error.message);
    return null;
  }
}

async function testToken() {
  console.log("Testing API token...\n");
  console.log("Token length:", process.env.HARDCOVER_API_TOKEN ? process.env.HARDCOVER_API_TOKEN.length : "undefined");
  console.log("Token preview:", process.env.HARDCOVER_API_TOKEN ? process.env.HARDCOVER_API_TOKEN.substring(0, 20) + "..." : "undefined");
  
  const TEST_QUERY = `
    query Test {
      me {
        username
      }
    }
  `;
  
  try {
    const response = await fetch(HARDCOVER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "authorization": `Bearer ${process.env.HARDCOVER_API_TOKEN}`,
        "User-Agent": "ReadThat-App/1.0",
      },
      body: JSON.stringify({
        query: TEST_QUERY,
        variables: {},
      }),
    });

    if (!response.ok) {
      console.error(`Token test failed: ${response.status} ${response.statusText}`);
      return false;
    }

    const data = await response.json();
    console.log("Token test response:", JSON.stringify(data, null, 2));
    
    if (data.data?.me?.[0]?.username) {
      console.log(`✅ Token working! Username: ${data.data.me[0].username}`);
      return true;
    } else {
      console.log("❌ Token test failed - no username returned");
      return false;
    }
  } catch (error) {
    console.error("Token test error:", error.message);
    return false;
  }
}

async function findBookIds() {
  console.log("Finding Hardcover book IDs for popular books...\n");
  
  // First test the token
  const tokenWorks = await testToken();
  if (!tokenWorks) {
    console.log("Aborting - token is not working");
    return;
  }
  
  const booksToSearch = [
    "Dune",
    "Mistborn",
    "Project Hail Mary",
    "Foundation",
    "The Name of the Wind",
    "The Martian"
  ];

  const foundIds = [];
  
  for (const title of booksToSearch) {
    const id = await searchBook(title);
    if (id) {
      foundIds.push(id);
    }
    // Small delay to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log("\nFound book IDs:");
  console.log(foundIds);
  console.log("\nCopy these IDs to your hardcover-api.ts file:");
  console.log(`const recommendedBookIds = [${foundIds.join(", ")}];`);
}

findBookIds();