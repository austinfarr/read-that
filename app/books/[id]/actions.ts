"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

async function getAuthenticatedUserId() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("User not authenticated");
  }

  return user.id;
}

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
  const userId = await getAuthenticatedUserId();

  // First, check if the book exists in user_books
  const { data: existingUserBook } = await supabase
    .from("user_books")
    .select("id, status")
    .eq("user_id", userId)
    .eq("hardcover_id", hardcoverId)
    .single();

  // If the book doesn't exist in user_books, add it as "finished"
  if (!existingUserBook) {
    const { error: userBookError } = await supabase.from("user_books").insert({
      user_id: userId,
      hardcover_id: hardcoverId,
      book_id: bookId,
      status: "finished",
      finish_date: new Date().toISOString().split("T")[0], // Today's date
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
        finish_date: new Date().toISOString().split("T")[0],
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
      user_id: userId,
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

  // Revalidate the book page and my-books page
  revalidatePath(`/books/${hardcoverId}`);
  revalidatePath("/my-books");

  return data;
}

export async function fetchReviews(hardcoverId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reviews")
    .select(
      `
      *,
      user:users(display_name, avatar_url)
    `
    )
    .eq("hardcover_id", hardcoverId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching reviews:", error);
    throw new Error(error.message);
  }

  return data || [];
}

export async function addToBookshelf(
  hardcoverId: string,
  bookId: string | undefined,
  status: "want_to_read" | "reading" | "finished"
) {
  const supabase = await createClient();
  const userId = await getAuthenticatedUserId();

  // Check if the book already exists in user_books
  const { data: existingUserBook } = await supabase
    .from("user_books")
    .select("id, status")
    .eq("user_id", userId)
    .eq("hardcover_id", hardcoverId)
    .single();

  if (existingUserBook) {
    // Update existing entry
    const updateData: any = { status };

    if (status === "reading" && existingUserBook.status !== "reading") {
      updateData.start_date = new Date().toISOString().split("T")[0];
    } else if (status === "finished") {
      updateData.finish_date = new Date().toISOString().split("T")[0];
      if (!existingUserBook.start_date) {
        updateData.start_date = new Date().toISOString().split("T")[0];
      }
    }

    const { error } = await supabase
      .from("user_books")
      .update(updateData)
      .eq("id", existingUserBook.id);

    if (error) {
      console.error("Error updating book status:", error);
      throw new Error(error.message);
    }
  } else {
    // Create new entry
    const insertData: any = {
      user_id: userId,
      hardcover_id: hardcoverId,
      book_id: bookId,
      status,
    };

    if (status === "reading") {
      insertData.start_date = new Date().toISOString().split("T")[0];
    } else if (status === "finished") {
      insertData.start_date = new Date().toISOString().split("T")[0];
      insertData.finish_date = new Date().toISOString().split("T")[0];
    }

    const { error } = await supabase.from("user_books").insert(insertData);

    if (error) {
      console.error("Error adding book to shelf:", error);
      throw new Error(error.message);
    }
  }

  // Revalidate the book page and my-books page
  revalidatePath(`/books/${hardcoverId}`);
  revalidatePath("/my-books");
}

export async function removeFromBookshelf(hardcoverId: string) {
  const supabase = await createClient();
  const userId = await getAuthenticatedUserId();

  const { error } = await supabase
    .from("user_books")
    .delete()
    .eq("user_id", userId)
    .eq("hardcover_id", hardcoverId);

  if (error) {
    console.error("Error removing book from shelf:", error);
    throw new Error(error.message);
  }

  // Revalidate the book page and my-books page
  revalidatePath(`/books/${hardcoverId}`);
  revalidatePath("/my-books");
}

export async function getUserBookStatus(hardcoverId: string) {
  try {
    const supabase = await createClient();
    const userId = await getAuthenticatedUserId();

    const { data, error } = await supabase
      .from("user_books")
      .select("status")
      .eq("user_id", userId)
      .eq("hardcover_id", hardcoverId)
      .single();

    if (error) {
      // Book not in user's library
      return null;
    }

    return data?.status || null;
  } catch (error) {
    // User not authenticated - return null so public users can still view the page
    return null;
  }
}

export async function getUserReview(hardcoverId: string) {
  try {
    const supabase = await createClient();
    const userId = await getAuthenticatedUserId();

    const { data, error } = await supabase
      .from("reviews")
      .select("id, rating, review_text, is_spoiler")
      .eq("user_id", userId)
      .eq("hardcover_id", hardcoverId)
      .single();

    if (error) {
      // User hasn't reviewed this book
      return null;
    }

    return data;
  } catch (error) {
    // User not authenticated - return null so public users can still view the page
    return null;
  }
}

export async function updateReview(
  reviewId: string,
  rating: number,
  reviewText: string,
  isSpoiler: boolean
) {
  const supabase = await createClient();
  const userId = await getAuthenticatedUserId();

  const { data, error } = await supabase
    .from("reviews")
    .update({
      rating,
      review_text: reviewText.trim() || null,
      is_spoiler: isSpoiler,
      updated_at: new Date().toISOString(),
    })
    .eq("id", reviewId)
    .eq("user_id", userId) // Security: only allow updating own reviews
    .select("*, hardcover_id")
    .single();

  if (error) {
    console.error("Error updating review:", error);
    throw new Error(error.message);
  }

  // Revalidate the book page and my-books page
  revalidatePath(`/books/${data.hardcover_id}`);
  revalidatePath("/my-books");

  return data;
}

export async function deleteReview(reviewId: string) {
  const supabase = await createClient();
  const userId = await getAuthenticatedUserId();

  // First get the review to get the hardcover_id for revalidation
  const { data: review } = await supabase
    .from("reviews")
    .select("hardcover_id")
    .eq("id", reviewId)
    .eq("user_id", userId)
    .single();

  if (!review) {
    throw new Error("Review not found or unauthorized");
  }

  const { error } = await supabase
    .from("reviews")
    .delete()
    .eq("id", reviewId)
    .eq("user_id", userId); // Security: only allow deleting own reviews

  if (error) {
    console.error("Error deleting review:", error);
    throw new Error(error.message);
  }

  // Revalidate the book page and my-books page
  revalidatePath(`/books/${review.hardcover_id}`);
  revalidatePath("/my-books");

  return { success: true };
}
