"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface AuthorBiographyProps {
  biography: string;
}

export function AuthorBiography({ biography }: AuthorBiographyProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsTruncation, setNeedsTruncation] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Basic function to clean the biography text
  const cleanBiography = (text: string) => {
    // Replace multiple line breaks with a single one
    return (
      text
        .replace(/<br\s*\/?>\s*<br\s*\/?>/g, "</p><p>")
        .replace(/<br\s*\/?>/g, " ")
        // Preserve bold and italic formatting
        .replace(/<b>/g, "<strong>")
        .replace(/<\/b>/g, "</strong>")
        .replace(/<i>/g, "<em>")
        .replace(/<\/i>/g, "</em>")
        // Wrap in paragraphs if not already wrapped
        .replace(/^(?!<p>)(.+?)(?!<\/p>)$/gm, "<p>$1</p>")
    );
  };

  useEffect(() => {
    // Check if the content needs truncation after render
    const checkTruncation = () => {
      if (contentRef.current) {
        const lineHeight = parseInt(
          window.getComputedStyle(contentRef.current).lineHeight
        );
        const maxLines = window.innerWidth < 640 ? 4 : 6; // 4 lines on mobile, 6 on desktop
        const maxHeight = lineHeight * maxLines;

        setNeedsTruncation(contentRef.current.scrollHeight > maxHeight + 10);
      }
    };

    checkTruncation();
    window.addEventListener("resize", checkTruncation);

    return () => window.removeEventListener("resize", checkTruncation);
  }, [biography]);

  const cleanedBiography = cleanBiography(biography);

  return (
    <div className="relative">
      <div
        ref={contentRef}
        className={`transition-all duration-300 ${
          !isExpanded && needsTruncation ? "line-clamp-4 sm:line-clamp-6" : ""
        }`}
        style={{
          WebkitMaskImage:
            !isExpanded && needsTruncation
              ? "linear-gradient(to bottom, black 80%, transparent 100%)"
              : undefined,
          maskImage:
            !isExpanded && needsTruncation
              ? "linear-gradient(to bottom, black 80%, transparent 100%)"
              : undefined,
        }}
        dangerouslySetInnerHTML={{
          __html: cleanedBiography,
        }}
      />

      {needsTruncation && (
        <div className="mt-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-base font-medium text-muted-foreground hover:text-foreground bg-transparent hover:bg-muted/50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-muted focus:ring-offset-2"
            aria-expanded={isExpanded}
            aria-label={
              isExpanded ? "Show less biography" : "Show more biography"
            }
          >
            {isExpanded ? (
              <>
                Show less
                <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                Show more
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}