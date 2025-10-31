import { supabase, supabaseAdmin } from './supabaseClient'
import { Post, CreatePostRequest, UpdatePostRequest } from './types'

/**
 * Get all posts (newest first)
 */
export async function getPosts(): Promise<{ data: Post[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching posts:', error)
      return { data: null, error: error.message }
    }

    return { data: data || [], error: null }
  } catch (err) {
    console.error('Unexpected error fetching posts:', err)
    return { data: null, error: 'Failed to fetch posts' }
  }
}

/**
 * Create a new post
 * Requires authentication
 */
export async function createPost(
  postData: CreatePostRequest,
  userId?: string
): Promise<{ data: Post | null; error: string | null }> {
  try {
    // Get the current user if not provided
    if (!userId) {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        return { data: null, error: 'Authentication required' }
      }
      userId = user.id
    }

    const newPost = {
      content: postData.content,
      author: postData.author || userId,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('posts')
      .insert(newPost)
      .select()
      .single()

    if (error) {
      console.error('Error creating post:', error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error creating post:', err)
    return { data: null, error: 'Failed to create post' }
  }
}

/**
 * Update an existing post
 * Requires authentication and ownership
 */
export async function updatePost(
  postData: UpdatePostRequest,
  userId?: string
): Promise<{ data: Post | null; error: string | null }> {
  try {
    // Get the current user if not provided
    if (!userId) {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        return { data: null, error: 'Authentication required' }
      }
      userId = user.id
    }

    // First check if the post exists and belongs to the user
    const { data: existingPost, error: fetchError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postData.id)
      .eq('author', userId)
      .single()

    if (fetchError || !existingPost) {
      return { data: null, error: 'Post not found or unauthorized' }
    }

    const updateData = {
      ...(postData.content && { content: postData.content }),
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('posts')
      .update(updateData)
      .eq('id', postData.id)
      .eq('author', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating post:', error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error updating post:', err)
    return { data: null, error: 'Failed to update post' }
  }
}

/**
 * Delete a post
 * Requires authentication and ownership
 */
export async function deletePost(
  postId: string,
  userId?: string
): Promise<{ data: boolean; error: string | null }> {
  try {
    // Get the current user if not provided
    if (!userId) {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        return { data: false, error: 'Authentication required' }
      }
      userId = user.id
    }

    // Check if the post exists and belongs to the user
    const { data: existingPost, error: fetchError } = await supabase
      .from('posts')
      .select('id')
      .eq('id', postId)
      .eq('author', userId)
      .single()

    if (fetchError || !existingPost) {
      return { data: false, error: 'Post not found or unauthorized' }
    }

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)
      .eq('author', userId)

    if (error) {
      console.error('Error deleting post:', error)
      return { data: false, error: error.message }
    }

    return { data: true, error: null }
  } catch (err) {
    console.error('Unexpected error deleting post:', err)
    return { data: false, error: 'Failed to delete post' }
  }
}

/**
 * Admin function to delete any post (uses service role key)
 * Use sparingly and with proper authorization
 */
export async function adminDeletePost(postId: string): Promise<{ data: boolean; error: string | null }> {
  try {
    const { error } = await supabaseAdmin
      .from('posts')
      .delete()
      .eq('id', postId)

    if (error) {
      console.error('Error admin deleting post:', error)
      return { data: false, error: error.message }
    }

    return { data: true, error: null }
  } catch (err) {
    console.error('Unexpected error admin deleting post:', err)
    return { data: false, error: 'Failed to delete post' }
  }
}