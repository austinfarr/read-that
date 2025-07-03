import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface User {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
}

interface UsersListProps {
  users: User[];
}

export default function UsersList({ users }: UsersListProps) {
  const getInitials = (user: User) => {
    const name = user.display_name || user.username || "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="grid gap-4">
      {users.map((user) => (
        <div key={user.id} className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.avatar_url || undefined} />
            <AvatarFallback>{getInitials(user)}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium truncate">
                {user.display_name || user.username || "Anonymous User"}
              </h3>
              {user.username && (
                <span className="text-sm text-muted-foreground">
                  @{user.username}
                </span>
              )}
            </div>
            {user.bio && (
              <p className="text-sm text-muted-foreground truncate">
                {user.bio}
              </p>
            )}
          </div>

          <Link href={`/users/${user.username}`}>
            <Button variant="outline" size="sm">
              View Profile
            </Button>
          </Link>
        </div>
      ))}
    </div>
  );
}