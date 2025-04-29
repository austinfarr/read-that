import React from "react";

interface BookDescriptionProps {
  description: string;
}

export function BookDescription({ description }: BookDescriptionProps) {
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

  return (
    <div
      className="prose dark:prose-invert max-w-none"
      dangerouslySetInnerHTML={{
        __html: cleanDescription(description),
      }}
    />
  );
}
