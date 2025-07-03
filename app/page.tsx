import { createClient } from "@/utils/supabase/server";
import { getSocialFeed, getRecentActivities } from "@/app/actions/users";
import ActivityFeed from "@/components/ActivityFeed";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, TrendingUp } from "lucide-react";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Show landing page for non-authenticated users
    return (
      <div className="container mx-auto px-4 py-16 mt-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">
            Track Your Reading Journey
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Discover books, track your reading progress, and connect with fellow readers
          </p>
          
          <div className="flex gap-4 justify-center mb-16">
            <Link href="/login">
              <Button size="lg">Get Started</Button>
            </Link>
            <Link href="/explore">
              <Button size="lg" variant="outline">Explore Books</Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div className="space-y-3">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Track Your Library</h3>
              <p className="text-muted-foreground">
                Keep track of books you want to read, are currently reading, and have finished
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Monitor Progress</h3>
              <p className="text-muted-foreground">
                Track your reading progress, set goals, and see your reading statistics
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Connect with Readers</h3>
              <p className="text-muted-foreground">
                Follow other readers, share reviews, and discover what your friends are reading
              </p>
            </div>
          </div>

          <div className="mt-16">
            <h2 className="text-2xl font-semibold mb-6">Recent Activity</h2>
            <ActivityFeed activities={await getRecentActivities(10)} showUser={true} />
          </div>
        </div>
      </div>
    );
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