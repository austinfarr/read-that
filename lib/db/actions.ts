"use server";

import { supabase } from "./supabase";

export async function getBooks() {
  const { data, error } = await supabase.from("user_books").select("*");
  if (error) {
    throw new Error(error.message);
  }
  return data;
}
