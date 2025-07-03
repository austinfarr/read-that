"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { followUser, unfollowUser } from "@/app/actions/users";
import { Loader2, Settings, UserPlus, UserMinus } from "lucide-react";
import Link from "next/link";

interface UserProfileHeaderProps {
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
  isOwnProfile: boolean;
  isFollowing: boolean;
  currentUserId?: string;
}

export default function UserProfileHeader({
  user,
  isOwnProfile,
  isFollowing: initialIsFollowing,
  currentUserId,
}: UserProfileHeaderProps) {
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);

  const handleFollowToggle = async () => {
    if (!currentUserId) {
      router.push("/login");
      return;
    }

    setIsLoading(true);
    
    if (isFollowing) {
      const result = await unfollowUser(user.id);
      if (result.success) {
        setIsFollowing(false);
      }
    } else {
      const result = await followUser(user.id);
      if (result.success) {
        setIsFollowing(true);
      }
    }
    
    setIsLoading(false);
    router.refresh();
  };

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
    <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
      <Avatar className="h-24 w-24">
        <AvatarImage src={user.avatar_url || undefined} />
        <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
      </Avatar>

      <div className="flex-1">
        <div className="flex items-center gap-4 mb-2">
          <h1 className="text-2xl font-bold">
            {user.display_name || user.username || "Anonymous User"}
          </h1>
          {user.username && (
            <span className="text-muted-foreground">@{user.username}</span>
          )}
        </div>

        {user.bio && (
          <p className="text-muted-foreground mb-4 max-w-2xl">{user.bio}</p>
        )}

        <div className="flex gap-6 text-sm">
          <div>
            <span className="font-semibold">{user.books_count || 0}</span>
            <span className="text-muted-foreground ml-1">books</span>
          </div>
          <div>
            <span className="font-semibold">{user.reviews_count || 0}</span>
            <span className="text-muted-foreground ml-1">reviews</span>
          </div>
          <div>
            <span className="font-semibold">{user.followers_count || 0}</span>
            <span className="text-muted-foreground ml-1">followers</span>
          </div>
          <div>
            <span className="font-semibold">{user.following_count || 0}</span>
            <span className="text-muted-foreground ml-1">following</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        {isOwnProfile ? (
          <Link href="/profile">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </Link>
        ) : (
          <Button
            onClick={handleFollowToggle}
            disabled={isLoading}
            variant={isFollowing ? "outline" : "default"}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isFollowing ? (
              <>
                <UserMinus className="h-4 w-4 mr-2" />
                Unfollow
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Follow
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}