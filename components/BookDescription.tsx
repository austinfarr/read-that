"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface BookDescriptionProps {
  description: string;
}

export function BookDescription({ description }: BookDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsTruncation, setNeedsTruncation] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Basic function to clean the description text
  const cleanDescription = (text: string) => {
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
        const maxLines = window.innerWidth < 640 ? 6 : 10; // 4 lines on mobile, 5 on desktop
        const maxHeight = lineHeight * maxLines;

        setNeedsTruncation(contentRef.current.scrollHeight > maxHeight + 10);
      }
    };

    checkTruncation();
    window.addEventListener("resize", checkTruncation);

    return () => window.removeEventListener("resize", checkTruncation);
  }, [description]);

  const cleanedDescription = cleanDescription(description);

  return (
    <div className="relative">
      <div
        ref={contentRef}
        className={`prose dark:prose-invert max-w-none transition-all duration-300 ${
          !isExpanded && needsTruncation ? "line-clamp-6 sm:line-clamp-10" : ""
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
          __html: cleanedDescription,
        }}
      />

      {needsTruncation && (
        <div className="mt-3 flex justify-center lg:justify-start">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-full text-sm font-medium transition-all duration-200 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-expanded={isExpanded}
            aria-label={
              isExpanded ? "Show less description" : "Show more description"
            }
          >
            {isExpanded ? (
              <>
                Show less
                <ChevronUp className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                Show more
                <ChevronDown className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
