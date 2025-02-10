"use client";
import Image from "next/image";
import { Card } from "./ui/card";
import { useState } from "react";

export default function BookCard({ book }) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="p-[2px] rounded-lg group bg-transparent transition-all duration-300 hover:bg-gradient-to-r hover:from-teal-400 hover:via-blue-500 hover:to-purple-500">
      <div className="relative overflow-hidden rounded-lg transition-all duration-300 w-[200px] bg-gray-950">
        <div className="relative w-full h-[300px]">
          <Image
            alt={`Cover of ${book.title}`}
            className={`object-cover transition-all duration-300 group-hover:scale-110 group-hover:blur-[2px] ${
              isLoading ? "grayscale blur-sm" : "grayscale-0 blur-0"
            }`}
            src={book.coverUrl || "/placeholder.svg?height=300&width=200"}
            fill
            sizes="200px"
            onLoad={() => setIsLoading(false)}
          />

          {/* Title container - centered and hidden by default */}
          <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 overflow-hidden rounded-lg backdrop-blur-md bg-white/10 opacity-0 transition-all duration-300 group-hover:opacity-100">
            <p className="p-2 text-sm text-white text-center">{book.title}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
