"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  Book,
  normalizeBook,
  HardcoverBook,
  HardcoverSearchBook,
  LocalBook,
} from "@/types/book";
import { BookOpen, ImageIcon, Star, Heart } from "lucide-react";

interface BookCardProps {
  book: HardcoverBook | HardcoverSearchBook | LocalBook;
  onClick?: (book: Book) => void;
  className?: string;
  href?: string; // Optional href for Link navigation
}

export default function BookCard({
  book,
  onClick,
  className = "",
  href,
}: BookCardProps) {
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

  const cardContent = (
    <>
      {/* Gradient border effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-400 via-blue-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-500 blur-sm" />

      <div
        className={`relative overflow-hidden rounded-xl transition-all duration-500 w-[120px] sm:w-[150px] md:w-[180px] bg-slate-900 border border-slate-700/50 group-hover:border-slate-600 shadow-xl group-hover:shadow-2xl ${
          onClick || href ? "cursor-pointer" : "cursor-default"
        }`}
      >
        <div className="relative w-full h-[180px] sm:h-[220px] md:h-[260px]">
          {/* Image or placeholder */}
          {normalizedBook.imageUrl && !hasError ? (
            <Image
              alt={`Cover of ${normalizedBook.title}`}
              className={`object-cover transition-all duration-500 group-hover:scale-110 group-hover:blur-[2px] ${
                isLoading ? "grayscale blur-sm" : "grayscale-0 blur-0"
              }`}
              src={normalizedBook.imageUrl}
              fill
              sizes="(max-width: 640px) 120px, (max-width: 768px) 150px, 180px"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex flex-col items-center justify-center text-slate-400">
              <ImageIcon className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mb-2 opacity-60" />
              <p className="text-[10px] sm:text-xs text-center px-2 opacity-60">
                No Image Available
              </p>
            </div>
          )}

          {/* Loading overlay */}
          {isLoading && normalizedBook.imageUrl && !hasError && (
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin" />
            </div>
          )}

          {/* Action buttons - appear on hover */}
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex gap-1 sm:gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            <button className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-slate-900/80 backdrop-blur-sm border border-slate-600/50 rounded-full flex items-center justify-center text-slate-300 hover:text-red-400 hover:border-red-400/50 transition-all duration-200">
              <Heart className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
            </button>
            <button className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-slate-900/80 backdrop-blur-sm border border-slate-600/50 rounded-full flex items-center justify-center text-slate-300 hover:text-yellow-400 hover:border-yellow-400/50 transition-all duration-200">
              <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
            </button>
          </div>

          {/* Title and author container - appears on hover */}
          <div className="absolute inset-x-2 bottom-2 sm:inset-x-3 sm:bottom-3 overflow-hidden rounded-xl backdrop-blur-xl bg-slate-900/90 border border-slate-600/30 opacity-0 transition-all duration-500 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0">
            <div className="p-2 sm:p-3 md:p-4">
              <p className="text-xs sm:text-sm font-semibold text-white text-center line-clamp-2 mb-1 sm:mb-2">
                {normalizedBook.title}
              </p>
              <p className="text-[10px] sm:text-xs text-slate-300 text-center line-clamp-1 mb-2 sm:mb-3">
                {authorText}
              </p>
              {normalizedBook.pageCount && (
                <div className="flex items-center justify-center text-[10px] sm:text-xs text-slate-400">
                  <BookOpen className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 sm:mr-1.5 text-teal-400" />
                  <span>{normalizedBook.pageCount} pages</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );

  // If href is provided, wrap in Link for prefetching
  if (href) {
    return (
      <Link
        href={href}
        className={`group relative transition-all duration-500 hover:scale-105 block ${className}`}
        prefetch={true}
      >
        {cardContent}
      </Link>
    );
  }

  // Otherwise, use div with onClick
  return (
    <div
      className={`group relative transition-all duration-500 hover:scale-105 ${
        onClick ? "cursor-pointer" : "cursor-default"
      } ${className}`}
      onClick={handleClick}
    >
      {cardContent}
    </div>
  );
}
