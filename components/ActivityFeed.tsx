import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookOpen, Star, BookMarked, CheckCircle, PlusCircle } from "lucide-react";

interface Activity {
  id: string;
  user_id: string;
  activity_type: string;
  book_id: string | null;
  hardcover_id: string | null;
  metadata: any;
  created_at: string;
  user_display_name: string | null;
  username: string | null;
  user_avatar_url: string | null;
  book_title: string | null;
  book_author: string | null;
  book_cover_url: string | null;
}

interface ActivityFeedProps {
  activities: Activity[];
  showUser?: boolean;
}

export default function ActivityFeed({ activities, showUser = true }: ActivityFeedProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'started_reading':
        return <BookOpen className="h-4 w-4 text-blue-500" />;
      case 'finished_reading':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'added_to_library':
        return <PlusCircle className="h-4 w-4 text-purple-500" />;
      case 'review_posted':
        return <Star className="h-4 w-4 text-yellow-500" />;
      case 'book_status_change':
        return <BookMarked className="h-4 w-4 text-orange-500" />;
      default:
        return <BookOpen className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityText = (activity: Activity) => {
    const userName = showUser ? (activity.user_display_name || activity.username || 'Someone') : 'You';
    
    switch (activity.activity_type) {
      case 'started_reading':
        return `${userName} started reading`;
      case 'finished_reading':
        return `${userName} finished reading`;
      case 'added_to_library':
        return `${userName} added to library`;
      case 'review_posted':
        return `${userName} reviewed`;
      case 'book_status_change':
        const { old_status, new_status } = activity.metadata || {};
        if (new_status === 'want_to_read') return `${userName} wants to read`;
        if (new_status === 'dnf') return `${userName} did not finish`;
        return `${userName} updated`;
      default:
        return `${userName} updated`;
    }
  };

  const getInitials = (activity: Activity) => {
    const name = activity.user_display_name || activity.username || "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <Card key={activity.id} className="p-4">
          <div className="flex gap-4">
            {showUser && (
              <Link href={`/users/${activity.username}`} className="shrink-0">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={activity.user_avatar_url || undefined} />
                  <AvatarFallback>{getInitials(activity)}</AvatarFallback>
                </Avatar>
              </Link>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2 mb-2">
                {getActivityIcon(activity.activity_type)}
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-medium">{getActivityText(activity)}</span>
                    {activity.metadata?.rating && (
                      <span className="text-muted-foreground ml-1">
                        ({(activity.metadata.rating / 2).toFixed(1)} ★)
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>

              {activity.book_id && (
                <Link href={`/books/${activity.book_id}`}>
                  <div className="flex gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
                    <div className="relative w-12 h-18 shrink-0">
                      {activity.book_cover_url ? (
                        <Image
                          src={activity.book_cover_url}
                          alt={activity.book_title || ''}
                          fill
                          className="object-cover rounded"
                          sizes="48px"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted rounded flex items-center justify-center">
                          <BookOpen className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-medium text-sm truncate">
                        {activity.book_title}
                      </h4>
                      <p className="text-xs text-muted-foreground truncate">
                        {activity.book_author}
                      </p>
                    </div>
                  </div>
                </Link>
              )}

              {activity.metadata?.has_text && activity.activity_type === 'review_posted' && (
                <p className="text-sm text-muted-foreground mt-2 italic">
                  Wrote a review
                </p>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}