"use server";

import { createClient } from "@/utils/supabase/server";

export async function getUserByUsername(username: string) {
  const supabase = await createClient();
  
  const { data: user, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('username', username)
    .single();

  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }

  return user;
}

export async function getUserBooks(userId: string, limit?: number) {
  const supabase = await createClient();
  
  let query = supabase
    .from('user_books')
    .select('*')
    .eq('user_id', userId)
    .eq('is_private', false)
    .order('created_at', { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data: userBooksData, error } = await query;

  if (error) {
    console.error('Error fetching user books:', error);
    return [];
  }

  if (!userBooksData || userBooksData.length === 0) {
    return [];
  }

  // Extract unique hardcover IDs
  const hardcoverIds = userBooksData
    .filter((ub) => ub.hardcover_id)
    .map((ub) => ub.hardcover_id as string);

  if (hardcoverIds.length === 0) {
    return userBooksData.map(ub => ({ ...ub, books: null }));
  }

  try {
    // Import hardcover utilities
    const { getBooksByIds, hardcoverToBook } = await import("@/utils/hardcover");
    
    // Fetch book details from Hardcover API
    const books = await getBooksByIds(hardcoverIds);

    // Convert to a map for easy lookup
    const booksMap: Record<string, any> = {};
    books.forEach((book) => {
      booksMap[book.id.toString()] = hardcoverToBook(book);
    });

    // Combine user book data with hardcover book data
    return userBooksData.map(userBook => ({
      ...userBook,
      books: userBook.hardcover_id ? booksMap[userBook.hardcover_id] || null : null
    }));
  } catch (error) {
    console.error('Error fetching book details from Hardcover:', error);
    return userBooksData.map(ub => ({ ...ub, books: null }));
  }
}

export async function getUserReviews(userId: string, limit?: number) {
  const supabase = await createClient();
  
  let query = supabase
    .from('reviews')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data: reviewsData, error } = await query;

  if (error) {
    console.error('Error fetching user reviews:', error);
    return [];
  }

  if (!reviewsData || reviewsData.length === 0) {
    return [];
  }

  // Extract unique hardcover IDs
  const hardcoverIds = reviewsData
    .filter((review) => review.hardcover_id)
    .map((review) => review.hardcover_id as string);

  if (hardcoverIds.length === 0) {
    return reviewsData.map(review => ({ ...review, books: null }));
  }

  try {
    // Import hardcover utilities
    const { getBooksByIds, hardcoverToBook } = await import("@/utils/hardcover");
    
    // Fetch book details from Hardcover API
    const books = await getBooksByIds(hardcoverIds);

    // Convert to a map for easy lookup
    const booksMap: Record<string, any> = {};
    books.forEach((book) => {
      booksMap[book.id.toString()] = hardcoverToBook(book);
    });

    // Combine review data with hardcover book data
    return reviewsData.map(review => ({
      ...review,
      books: review.hardcover_id ? booksMap[review.hardcover_id] || null : null
    }));
  } catch (error) {
    console.error('Error fetching book details from Hardcover:', error);
    return reviewsData.map(review => ({ ...review, books: null }));
  }
}

export async function checkIfFollowing(followerId: string, followingId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .single();

  return !!data;
}

export async function followUser(followingId: string) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return { error: 'Not authenticated' };
  }

  const { error } = await supabase
    .from('follows')
    .insert({
      follower_id: user.id,
      following_id: followingId
    });

  if (error) {
    console.error('Error following user:', error);
    return { error: error.message };
  }

  return { success: true };
}

export async function unfollowUser(followingId: string) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return { error: 'Not authenticated' };
  }

  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', user.id)
    .eq('following_id', followingId);

  if (error) {
    console.error('Error unfollowing user:', error);
    return { error: error.message };
  }

  return { success: true };
}

export async function getFollowers(userId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('follows')
    .select(`
      follower:users!follower_id (
        id,
        username,
        display_name,
        avatar_url,
        bio
      )
    `)
    .eq('following_id', userId);

  if (error) {
    console.error('Error fetching followers:', error);
    return [];
  }

  return data?.map(item => item.follower) || [];
}

export async function getFollowing(userId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('follows')
    .select(`
      following:users!following_id (
        id,
        username,
        display_name,
        avatar_url,
        bio
      )
    `)
    .eq('follower_id', userId);

  if (error) {
    console.error('Error fetching following:', error);
    return [];
  }

  return data?.map(item => item.following) || [];
}

export async function searchUsers(query: string) {
  const supabase = await createClient();
  
  if (!query || query.trim().length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
    .limit(20);

  if (error) {
    console.error('Error searching users:', error);
    return [];
  }

  return data || [];
}

export async function getSocialFeed(userId: string, limit: number = 20) {
  const supabase = await createClient();
  
  // First get the list of users being followed
  const { data: followingData } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', userId);
  
  const followingIds = followingData?.map(f => f.following_id) || [];
  
  // Include the user's own activities and activities from people they follow
  const userIds = [userId, ...followingIds];
  
  const { data, error } = await supabase
    .from('social_feed')
    .select('*')
    .in('user_id', userIds)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching social feed:', error);
    return [];
  }

  return data || [];
}

export async function getRecentActivities(limit: number = 20) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('social_feed')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching recent activities:', error);
    return [];
  }

  return data || [];
}