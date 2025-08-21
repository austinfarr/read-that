import { createClient } from "@/utils/supabase/server";
import { getSocialFeed } from "@/app/actions/users";
import ActivityFeed from "@/components/ActivityFeed";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Redirect non-authenticated users to explore page
    redirect('/explore');
  }

  // Show social feed for authenticated users
  const activities = await getSocialFeed(user.id, 20);

  return (
    <div className="container mx-auto px-4 py-8 mt-20 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Your Feed</h1>
        <p className="text-muted-foreground">
          See what you and the people you follow are reading
        </p>
      </div>

      {activities.length > 0 ? (
        <ActivityFeed activities={activities} showUser={true} />
      ) : (
        <div className="text-center py-16">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Your feed is empty</h2>
          <p className="text-muted-foreground mb-6">
            Follow other readers to see their activity here
          </p>
          <Link href="/users">
            <Button>Discover Readers</Button>
          </Link>
        </div>
      )}
    </div>
  );
}