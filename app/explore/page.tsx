import BookCard from "@/components/BookCard";
import React from "react";

export default function ExplorePage() {
  const books = [
    {
      id: 1,
      title: "Mistborn",
      author: "Brandon Sanderson",
      coverUrl:
        "https://m.media-amazon.com/images/I/91U6rc7u0yL._AC_UF1000,1000_QL80_.jpg",
      description: "Between life and death there is a library...",
      pageCount: 304,
      unread: true,
    },
    {
      id: 2,
      title: "Project Hail Mary",
      author: "Andy Weir",
      coverUrl: "https://mpd-biblio-covers.imgix.net/9781429961813.jpg",
      description: "A lone astronaut must save the earth from disaster...",
      pageCount: 496,
      unread: true,
    },
    {
      id: 3,
      title: "Dune",
      author: "Frank Herbert",
      coverUrl: "https://m.media-amazon.com/images/I/81TmnPZWb0L.jpg",
      description: "A stunning blend of adventure and mysticism...",
      pageCount: 412,
      unread: true,
    },
    {
      id: 4,
      title: "Foundation",
      author: "Isaac Asimov",
      coverUrl: "/api/placeholder/200/300",
      description: "The story of our future begins with the Foundation...",
      pageCount: 255,
      unread: true,
    },
  ];

  return (
    <div>
      <h1 className="text-2xl mb-2">Books you might like...</h1>
      <div className="flex gap-4 w-full flex-wrap px-4">
        {books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>

      <div className="border my-6"></div>

      <h1 className="text-2xl mb-2">Books you might like...</h1>
      <div className="flex gap-4 w-full flex-wrap">
        {books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </div>
  );
}
