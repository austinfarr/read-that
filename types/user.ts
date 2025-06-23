export interface User {
  id: string;
  email: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserProfile extends User {
  // Additional fields that might be joined from other tables
  review_count?: number;
  books_read_count?: number;
  want_to_read_count?: number;
}