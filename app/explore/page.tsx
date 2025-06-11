"use client";
import BookCard from "@/components/BookCard";
import { LocalBook, Book } from "@/types/book";
import { useRouter } from "next/navigation";
import React from "react";

export default function ExplorePage() {
  const router = useRouter();
  const books: LocalBook[] = [
    {
      id: 1,
      title: "Mistborn: The Final Empire",
      author: "Brandon Sanderson",
      coverUrl:
        "https://m.media-amazon.com/images/I/91U6rc7u0yL._AC_UF1000,1000_QL80_.jpg",
      description: "In a world where ash falls from the sky, and mist dominates the night, an unlikely hero must learn to use the magic of Allomancy to defeat an immortal emperor who has reigned for a thousand years.",
      pageCount: 541,
      unread: true,
    },
    {
      id: 2,
      title: "Project Hail Mary",
      author: "Andy Weir",
      coverUrl: "https://mpd-biblio-covers.imgix.net/9781429961813.jpg",
      description: "A lone astronaut must save the earth from disaster in this science fiction thriller. Ryland Grace wakes up on a spaceship with no memory of why he's there, discovering he might be humanity's last hope.",
      pageCount: 496,
      unread: true,
    },
    {
      id: 3,
      title: "Dune",
      author: "Frank Herbert",
      coverUrl: "https://m.media-amazon.com/images/I/81TmnPZWb0L.jpg",
      description: "Set on the desert planet Arrakis, this epic follows Paul Atreides as he becomes embroiled in a struggle for control of the universe's most valuable substance - the spice melange.",
      pageCount: 688,
      unread: true,
    },
    {
      id: 4,
      title: "Foundation",
      author: "Isaac Asimov",
      coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1417900846i/29579.jpg",
      description: "For twelve thousand years the Galactic Empire has ruled supreme. Now it is dying. But only Hari Seldon, creator of the revolutionary science of psychohistory, can see into the future.",
      pageCount: 244,
      unread: true,
    },
    {
      id: 5,
      title: "The Name of the Wind",
      author: "Patrick Rothfuss",
      coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1270352123i/186074.jpg",
      description: "Told in Kvothe's own voice, this is the tale of the magically gifted young man who grows to be the most notorious wizard his world has ever seen.",
      pageCount: 662,
      unread: true,
    },
    {
      id: 6,
      title: "The Martian",
      author: "Andy Weir",
      coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1413706054i/18007564.jpg",
      description: "Six days ago, astronaut Mark Watney became one of the first people to walk on Mars. Now, he's sure he'll be the first person to die there.",
      pageCount: 369,
      unread: true,
    },
  ];

  const handleBookClick = (book: Book) => {
    // For now, just navigate to a placeholder book detail page
    // Later this could be enhanced to navigate to actual book details
    console.log("Book clicked:", book);
    // router.push(`/books/${book.id}`);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Discover Your Next Great Read</h1>
        <p className="text-muted-foreground">Handpicked recommendations based on popular favorites</p>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Science Fiction & Fantasy</h2>
        <div className="flex gap-6 w-full flex-wrap justify-center sm:justify-start">
          {books.slice(0, 3).map((book) => (
            <BookCard 
              key={book.id} 
              book={book} 
              onClick={handleBookClick}
            />
          ))}
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">More Great Reads</h2>
        <div className="flex gap-6 w-full flex-wrap justify-center sm:justify-start">
          {books.slice(3).map((book) => (
            <BookCard 
              key={book.id} 
              book={book} 
              onClick={handleBookClick}
            />
          ))}
        </div>
      </div>

      <div className="text-center py-8">
        <p className="text-muted-foreground">More recommendations coming soon...</p>
      </div>
    </div>
  );
}
