"use client";
import Image from "next/image";
import { Card } from "./ui/card";
import { useState } from "react";
import { Book, normalizeBook, HardcoverBook, HardcoverSearchBook, LocalBook } from "@/types/book";
import { BookOpen, ImageIcon } from "lucide-react";

interface BookCardProps {
  book: HardcoverBook | HardcoverSearchBook | LocalBook;
  onClick?: (book: Book) => void;
  className?: string;
}

export default function BookCard({ book, onClick, className = "" }: BookCardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  const normalizedBook = normalizeBook(book);
  const authorText = Array.isArray(normalizedBook.author) 
    ? normalizedBook.author.join(", ") 
    : normalizedBook.author;

  const handleClick = () => {
    if (onClick) {
      onClick(normalizedBook);
    }
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div 
      className={`p-[2px] rounded-lg group bg-transparent transition-all duration-300 hover:bg-gradient-to-r hover:from-teal-400 hover:via-blue-500 hover:to-purple-500 ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
      onClick={handleClick}
    >
      <div className="relative overflow-hidden rounded-lg transition-all duration-300 w-[200px] bg-gray-950">
        <div className="relative w-full h-[300px]">
          {/* Image or placeholder */}
          {normalizedBook.imageUrl && !hasError ? (
            <Image
              alt={`Cover of ${normalizedBook.title}`}
              className={`object-cover transition-all duration-300 group-hover:scale-110 group-hover:blur-[2px] ${
                isLoading ? "grayscale blur-sm" : "grayscale-0 blur-0"
              }`}
              src={normalizedBook.imageUrl}
              fill
              sizes="200px"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex flex-col items-center justify-center text-gray-400">
              <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
              <p className="text-xs text-center px-2 opacity-50">No Image Available</p>
            </div>
          )}

          {/* Loading overlay */}
          {isLoading && normalizedBook.imageUrl && !hasError && (
            <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
            </div>
          )}

          {/* Title and author container - appears on hover */}
          <div className="absolute inset-x-4 bottom-4 overflow-hidden rounded-lg backdrop-blur-md bg-black/30 opacity-0 transition-all duration-300 group-hover:opacity-100">
            <div className="p-3">
              <p className="text-sm font-medium text-white text-center line-clamp-2 mb-1">
                {normalizedBook.title}
              </p>
              <p className="text-xs text-white/80 text-center line-clamp-1">
                {authorText}
              </p>
              {normalizedBook.pageCount && (
                <div className="flex items-center justify-center mt-2 text-xs text-white/60">
                  <BookOpen className="w-3 h-3 mr-1" />
                  {normalizedBook.pageCount} pages
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
