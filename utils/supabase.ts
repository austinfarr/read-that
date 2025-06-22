// Re-export the client creation functions
export { createClient as createBrowserClient } from './supabase/client'

// For backward compatibility and client components
import { createClient } from './supabase/client'
export const supabase = createClient()

// Type definitions for our database
export interface DatabaseBook {
  id: string
  hardcover_id: string | null
  google_books_id: string | null
  isbn: string | null
  title: string
  author: string
  cover_url: string | null
  description: string | null
  page_count: number | null
  publication_year: number | null
  metadata: any
  last_synced: string
  created_at: string
  updated_at: string
}

export interface UserBook {
  id: string
  user_id: string
  book_id: string | null
  hardcover_id: string | null
  status: 'want_to_read' | 'reading' | 'finished' | 'dnf'
  start_date: string | null
  finish_date: string | null
  current_page: number | null
  rating: number | null
  notes: string | null
  is_favorite: boolean
  is_private: boolean
  created_at: string
  updated_at: string
  external_metadata: any
  // Joined data
  book?: DatabaseBook
}

export interface User {
  id: string
  display_name: string | null
  avatar_url: string | null
  preferences: any
  created_at: string
  updated_at: string
}

export interface Review {
  id: string
  user_id: string
  book_id: string | null
  hardcover_id: string
  rating: number
  review_text: string | null
  is_spoiler: boolean
  helpful_count: number
  created_at: string
  updated_at: string
  // Joined data
  user?: User
}

// Sample user ID for development (replace with auth when implemented)
export const SAMPLE_USER_ID = '0f797a63-1c1e-4ed9-836f-9bec0305c84a'