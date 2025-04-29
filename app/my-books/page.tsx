import MyBooksList from '@/components/MyBooksList';
import { getBooks } from '@/lib/db/actions';
import React from 'react';

export const dynamic = 'force-dynamic';

export default async function MyBooksPage() {
  const books = await getBooks();
  console.log(books);

  return (
    <div className="max-w-lg mx-auto py-8">
      <MyBooksList books={books} />
    </div>
  );
}
