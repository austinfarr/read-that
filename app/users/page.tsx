"use client";

import { useState, useEffect, useTransition } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { searchUsers } from "@/app/actions/users";
import { Input } from "@/components/ui/input";
import { Users, Search, Loader2 } from "lucide-react";
import UserCard from "@/components/UserCard";

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();
  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    if (debouncedSearch.trim()) {
      startTransition(async () => {
        const results = await searchUsers(debouncedSearch);
        setUsers(results);
      });
    } else {
      setUsers([]);
    }
  }, [debouncedSearch]);

  return (
    <div className="container mx-auto px-4 py-8 mt-20 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Discover Readers</h1>
        <p className="text-muted-foreground">
          Find and follow other readers to see what they&#39;re reading
        </p>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by username or display name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {isPending && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}

      {!isPending && searchQuery && users.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            No users found matching &quot;{searchQuery}&quot;
          </p>
        </div>
      )}

      {!isPending && users.length > 0 && (
        <div className="grid gap-4">
          {users.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      )}

      {!searchQuery && !isPending && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            Start typing to search for users
          </p>
        </div>
      )}
    </div>
  );
}
