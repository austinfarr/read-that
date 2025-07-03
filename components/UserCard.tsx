"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { BookOpen, NotebookPen } from "lucide-react";

interface UserCardProps {
  user: {
    id: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    followers_count: number;
    following_count: number;
    books_count: number;
    reviews_count: number;
  };
}

export default function UserCard({ user }: UserCardProps) {
  const getInitials = () => {
    const name = user.display_name || user.username || "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={user.avatar_url || undefined} />
          <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-lg truncate">
              {user.display_name || user.username || "Anonymous User"}
            </h3>
            {user.username && (
              <span className="text-muted-foreground text-sm">
                @{user.username}
              </span>
            )}
          </div>

          {user.bio && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {user.bio}
            </p>
          )}

          <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>{user.books_count || 0} books</span>
            </div>
            <div className="flex items-center gap-1">
              <NotebookPen className="h-4 w-4" />
              <span>{user.reviews_count || 0} reviews</span>
            </div>
            <div>
              <span>{user.followers_count || 0} followers</span>
            </div>
          </div>
        </div>

        <Link href={`/users/${user.username}`}>
          <Button variant="outline">View Profile</Button>
        </Link>
      </div>
    </Card>
  );
}