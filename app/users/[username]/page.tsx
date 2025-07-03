import { notFound } from "next/navigation";
import { getUserByUsername, getUserBooks, getUserReviews, checkIfFollowing, getFollowers, getFollowing } from "@/app/actions/users";
import { createClient } from "@/utils/supabase/server";
import UserProfileHeader from "@/components/UserProfileHeader";
import UserBooksGrid from "@/components/UserBooksGrid";
import UserReviewsList from "@/components/UserReviewsList";
import UsersList from "@/components/UsersList";
import ActivityFeed from "@/components/ActivityFeed";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const user = await getUserByUsername(username);

  if (!user) {
    notFound();
  }

  const supabase = await createClient();
  const { data: { user: currentUser } } = await supabase.auth.getUser();

  const isOwnProfile = currentUser?.id === user.id;
  const isFollowing = currentUser && !isOwnProfile 
    ? await checkIfFollowing(currentUser.id, user.id)
    : false;

  const supabaseActivities = await createClient();
  const { data: userActivities } = await supabaseActivities
    .from('social_feed')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20);

  const [userBooks, userReviews, followers, following] = await Promise.all([
    getUserBooks(user.id),
    getUserReviews(user.id),
    getFollowers(user.id),
    getFollowing(user.id),
  ]);

  const currentlyReading = userBooks.filter(ub => ub.status === 'reading');
  const finishedBooks = userBooks.filter(ub => ub.status === 'finished');
  const wantToRead = userBooks.filter(ub => ub.status === 'want_to_read');

  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      <UserProfileHeader 
        user={user}
        isOwnProfile={isOwnProfile}
        isFollowing={isFollowing}
        currentUserId={currentUser?.id}
      />

      <Tabs defaultValue="library" className="mt-8">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="library">Library</TabsTrigger>
          <TabsTrigger value="currently-reading">Reading</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="followers">Followers</TabsTrigger>
          <TabsTrigger value="following">Following</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="library" className="mt-6">
          <div className="space-y-8">
            {currentlyReading.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Currently Reading</h3>
                <UserBooksGrid books={currentlyReading} />
              </div>
            )}
            
            {finishedBooks.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Finished Books ({finishedBooks.length})</h3>
                <UserBooksGrid books={finishedBooks} />
              </div>
            )}
            
            {wantToRead.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Want to Read ({wantToRead.length})</h3>
                <UserBooksGrid books={wantToRead} />
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="currently-reading" className="mt-6">
          {currentlyReading.length > 0 ? (
            <UserBooksGrid books={currentlyReading} />
          ) : (
            <p className="text-muted-foreground text-center py-8">
              {isOwnProfile ? "You're" : `${user.display_name || user.username} is`} not currently reading any books.
            </p>
          )}
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          {userReviews.length > 0 ? (
            <UserReviewsList reviews={userReviews} />
          ) : (
            <p className="text-muted-foreground text-center py-8">
              {isOwnProfile ? "You haven't" : `${user.display_name || user.username} hasn't`} written any reviews yet.
            </p>
          )}
        </TabsContent>

        <TabsContent value="followers" className="mt-6">
          {followers.length > 0 ? (
            <UsersList users={followers} />
          ) : (
            <p className="text-muted-foreground text-center py-8">
              {isOwnProfile ? "You don't" : `${user.display_name || user.username} doesn't`} have any followers yet.
            </p>
          )}
        </TabsContent>

        <TabsContent value="following" className="mt-6">
          {following.length > 0 ? (
            <UsersList users={following} />
          ) : (
            <p className="text-muted-foreground text-center py-8">
              {isOwnProfile ? "You're" : `${user.display_name || user.username} is`} not following anyone yet.
            </p>
          )}
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          {userActivities && userActivities.length > 0 ? (
            <ActivityFeed activities={userActivities} showUser={false} />
          ) : (
            <p className="text-muted-foreground text-center py-8">
              {isOwnProfile ? "You haven't" : `${user.display_name || user.username} hasn't`} performed any reading activities yet.
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}