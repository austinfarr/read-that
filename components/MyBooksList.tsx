"use client";
import React, { useState } from "react";
import { Button } from "./ui/button";
import ReadBookCard from "./ReadBookCard";

interface MyBooksListProps {
  books: any[];
}

export default function MyBooksList({ books }: MyBooksListProps) {
  const [selectedFilter, setSelectedFilter] = useState("read");

  const filteredBooks = books.filter((book) => {
    if (selectedFilter === "read") {
      return book.status === "read";
    }
    return book.status === "want_to_read";
  });

  return (
    <div>
      <div className="flex items-center border border-primary rounded-full w-full p-1">
        <Button
          onClick={() => setSelectedFilter("read")}
          className={`flex-1 rounded-full ${
            selectedFilter === "read"
              ? "bg-primary text-white"
              : "bg-transparent text-primary"
          }  hover:bg-primary hover:text-white`}
        >
          Read
        </Button>
        <Button
          onClick={() => setSelectedFilter("unread")}
          className={`flex-1 rounded-full ${
            selectedFilter === "unread"
              ? "bg-primary text-white"
              : "bg-transparent text-primary"
          }  hover:bg-primary hover:text-white`}
        >
          Want to Read
        </Button>
      </div>
      <div className="flex items-center justify-center flex-col gap-2">
        {filteredBooks.map((book) => {
          return (
            <div key={book.id} className="bg-blue-500 w-[400px]">
              <ReadBookCard key={book.id} book={book} />
            </div>
            //   <div
            //     key={book.id}
            //     className="flex items-center border-b border-gray-200 py-2"
            //   >
            //     <Image
            //       src={book.coverUrl}
            //       alt={`Cover of ${book.title}`}
            //       className="w-16 h-24 object-cover rounded-lg"
            //     />
            //     <div className="flex-1 ml-4">
            //       <h2 className="text-lg font-semibold">{book.title}</h2>
            //       <p className="text-sm text-gray-500">{book.author}</p>
            //     </div>
            //     <Button className="bg-primary text-white">Mark as Read</Button>
            //   </div>
          );
        })}
      </div>
    </div>
  );
}
