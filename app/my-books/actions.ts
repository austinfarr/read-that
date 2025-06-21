import { Book } from "@/types/book";
import { getBooksByIds, hardcoverToBook } from "@/utils/hardcover";
import { SAMPLE_USER_ID, type UserBook } from "@/utils/supabase";
import { revalidatePath } from "next/cache";

export async function fetchUserBooks(): Promise<{
  userBooks: UserBook[];
  booksData: Record<string, Book>;
}> {
  try {
    // Import server client dynamically to avoid edge cases
    const { createClient } = await import("@/utils/supabase/server");
    const supabase = await createClient();

    // First, fetch user books from Supabase
    const { data, error } = await supabase
      .from("user_books")
      .select("*")
      .eq("user_id", SAMPLE_USER_ID)
      .order("updated_at", { ascending: false });

    if (error) throw error;

    const userBooksData = data || [];

    // Extract unique hardcover IDs
    const hardcoverIds = userBooksData
      .filter((ub) => ub.hardcover_id)
      .map((ub) => ub.hardcover_id as string);

    const booksData: Record<string, Book> = {};

    if (hardcoverIds.length > 0) {
      // Fetch book details from Hardcover API
      const books = await getBooksByIds(hardcoverIds);

      // Convert to a map for easy lookup
      books.forEach((book) => {
        booksData[book.id.toString()] = hardcoverToBook(book);
      });
    }

    return { userBooks: userBooksData, booksData };
  } catch (error) {
    console.error("Error fetching user books:", error);
    return { userBooks: [], booksData: {} };
  }
}

export async function updateBookProgress(userBookId: string, currentPage: number) {
  try {
    const { createClient } = await import("@/utils/supabase/server");
    const supabase = await createClient();

    const { error } = await supabase
      .from("user_books")
      .update({
        current_page: currentPage,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userBookId)
      .eq("user_id", SAMPLE_USER_ID);

    if (error) throw error;

    revalidatePath("/my-books");
    return { success: true };
  } catch (error) {
    console.error("Error updating book progress:", error);
    return { success: false, error: "Failed to update progress" };
  }
}

export async function updateBookStatus(userBookId: string, status: UserBook["status"]) {
  try {
    const { createClient } = await import("@/utils/supabase/server");
    const supabase = await createClient();

    const updates: Partial<UserBook> = {
      status,
      updated_at: new Date().toISOString(),
    };

    // Set dates based on status
    if (status === "reading") {
      updates.start_date = new Date().toISOString();
      updates.finish_date = null;
    } else if (status === "finished") {
      updates.finish_date = new Date().toISOString();
    }

    const { error } = await supabase
      .from("user_books")
      .update(updates)
      .eq("id", userBookId)
      .eq("user_id", SAMPLE_USER_ID);

    if (error) throw error;

    revalidatePath("/my-books");
    return { success: true };
  } catch (error) {
    console.error("Error updating book status:", error);
    return { success: false, error: "Failed to update status" };
  }
}

export async function updateBookNotes(userBookId: string, notes: string) {
  try {
    const { createClient } = await import("@/utils/supabase/server");
    const supabase = await createClient();

    const { error } = await supabase
      .from("user_books")
      .update({
        notes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userBookId)
      .eq("user_id", SAMPLE_USER_ID);

    if (error) throw error;

    revalidatePath("/my-books");
    return { success: true };
  } catch (error) {
    console.error("Error updating book notes:", error);
    return { success: false, error: "Failed to update notes" };
  }
}