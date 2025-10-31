// Core Post type
export type Post = {
  id: string
  content: string
  author: string | null
  created_at: string
  updated_at?: string
}

// Request/Response types
export type CreatePostRequest = {
  content: string
  author?: string
}

export type UpdatePostRequest = {
  id: string
  content?: string
}

export type DeletePostRequest = {
  id: string
}

// API Response types
export type ApiResponse<T = any> = {
  success: boolean
  data?: T
  error?: string
}

export type PostsResponse = ApiResponse<Post[]>
export type PostResponse = ApiResponse<Post>

// Database schema type for Supabase
export interface Database {
  public: {
    Tables: {
      posts: {
        Row: Post
        Insert: Omit<Post, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Omit<Post, 'id' | 'created_at'>>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}