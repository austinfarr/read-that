# Hardcover API Reference

This document contains findings about the Hardcover GraphQL API structure and working queries.

## API Endpoint
- URL: `https://api.hardcover.app/v1/graphql`
- Authentication: Bearer token required in Authorization header
- Method: POST

## Key Findings

### 1. Authors Table Structure
Available fields on `authors` table:
- `id` (Int, NON_NULL)
- `name` (String, NON_NULL)
- `bio` (String) - available but returns null for many authors
- `cached_image` (String, NON_NULL) - URL string, NOT an object
- `image` (object) - has `url`, `color`, `height`, `width` fields
- `born_date` (date)
- `death_date` (date)
- `location` (String)
- `books_count` (Int, NON_NULL)
- `contributions` (array) - links to books via contributions table
- `slug` (String)

### 2. Books Table Structure
Available fields on `books` table:
- `id` (Int)
- `title` (String)
- `subtitle` (String)
- `description` (String)
- `pages` (Int)
- `release_date` (String)
- `slug` (String)
- `image` (object) - has `url` field
- `contributions` (array) - links to authors

### 3. Search API
The search API uses a different structure:
- Endpoint: `search(query: String!, query_type: String!, per_page: Int!, page: Int!)`
- Query types: "Title", "Author"
- Returns: `results` object containing `hits` array
- Hit structure: `{ document: { id, name, image: {url}, books, books_count, ... } }`

## Working Queries

### Get Author by ID
```graphql
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
```

### Get Books by Author ID
```graphql
query GetBooksByAuthor($authorId: Int!) {
  books(where: {contributions: {author_id: {_eq: $authorId}}}, limit: 10, order_by: {release_date: desc}) {
    id
    title
    subtitle
    description
    pages
    release_date
    image {
      url
    }
  }
}
```

### Search for Authors
```graphql
query SearchAuthors($query: String!) {
  search(query: $query, query_type: "Author", per_page: 10, page: 1) {
    results
  }
}
```

### Get Multiple Authors by IDs
```graphql
query GetMultipleAuthors($ids: [Int!]!) {
  authors(where: {id: {_in: $ids}}) {
    id
    name
    cached_image
    image {
      url
    }
    books_count
  }
}
```

## Important Notes

1. **No ilike operator**: The API doesn't support `_ilike` for case-insensitive pattern matching
2. **cached_image is a string**: Unlike `image`, `cached_image` is a URL string, not an object
3. **No direct books relation**: Authors don't have a direct `books` field. Use contributions or separate query
4. **Search returns different structure**: Search results have a completely different format than direct queries
5. **Limited ordering**: Some fields like `rating` or `books_aggregate` are not available for ordering

## Example Author IDs
- Brandon Sanderson: 204214
- Stephen King: 206317
- J.K. Rowling: 207572
- George R.R. Martin: 206880
- Neil Gaiman: 208073

## Example Book IDs  
- Mistborn: The Final Empire: 369692
- The Way of Kings: 386446
- Dune: 312460
- Project Hail Mary: 427578