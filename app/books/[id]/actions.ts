"use server";

import { createClient } from "@/utils/supabase/server";
import { SAMPLE_USER_ID } from "@/utils/supabase";

export async function getReviewStats(hardcoverId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("reviews")
    .select("rating")
    .eq("hardcover_id", hardcoverId);

  if (error || !data || data.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
    };
  }

  const totalReviews = data.length;
  const sumRatings = data.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = sumRatings / totalReviews;

  return {
    averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
    totalReviews,
  };
}

export async function submitReview(
  hardcoverId: string,
  bookId: string | undefined,
  rating: number,
  reviewText: string,
  isSpoiler: boolean
) {
  const supabase = await createClient();

  // First, check if the book exists in user_books
  const { data: existingUserBook } = await supabase
    .from("user_books")
    .select("id, status")
    .eq("user_id", SAMPLE_USER_ID)
    .eq("hardcover_id", hardcoverId)
    .single();

  // If the book doesn't exist in user_books, add it as "finished"
  if (!existingUserBook) {
    const { error: userBookError } = await supabase
      .from("user_books")
      .insert({
        user_id: SAMPLE_USER_ID,
        hardcover_id: hardcoverId,
        book_id: bookId,
        status: "finished",
        finish_date: new Date().toISOString().split('T')[0], // Today's date
      });

    if (userBookError) {
      console.error("Error adding book to user_books:", userBookError);
      throw new Error(userBookError.message);
    }
  } else if (existingUserBook.status !== "finished") {
    // If the book exists but isn't marked as finished, update it
    const { error: updateError } = await supabase
      .from("user_books")
      .update({
        status: "finished",
        finish_date: new Date().toISOString().split('T')[0],
      })
      .eq("id", existingUserBook.id);

    if (updateError) {
      console.error("Error updating book status:", updateError);
      throw new Error(updateError.message);
    }
  }

  // Now submit the review
  const { data, error } = await supabase
    .from("reviews")
    .insert({
      user_id: SAMPLE_USER_ID,
      hardcover_id: hardcoverId,
      book_id: bookId,
      rating,
      review_text: reviewText.trim() || null,
      is_spoiler: isSpoiler,
    })
    .select()
    .single();

  if (error) {
    console.error("Error submitting review:", error);
    throw new Error(error.message);
  }

  return data;
}

export async function fetchReviews(hardcoverId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reviews")
    .select(`
      *,
      user:users(display_name, avatar_url)
    `)
    .eq("hardcover_id", hardcoverId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching reviews:", error);
    throw new Error(error.message);
  }

  return data || [];
}