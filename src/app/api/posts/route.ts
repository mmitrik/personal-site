import { NextRequest, NextResponse } from 'next/server'
import { getPosts, createPost, updatePost, deletePost } from '../../../../lib/posts'
import { supabase } from '../../../../lib/supabaseClient'
import { CreatePostRequest, UpdatePostRequest, DeletePostRequest, ApiResponse } from '../../../../lib/types'

/**
 * GET /api/posts
 * Returns all posts (newest first)
 * No authentication required for reading
 */
export async function GET(): Promise<NextResponse> {
  try {
    const { data: posts, error } = await getPosts()

    if (error) {
      return NextResponse.json(
        { success: false, error } as ApiResponse,
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, data: posts } as ApiResponse,
      { status: 200 }
    )
  } catch (error) {
    console.error('GET /api/posts error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' } as ApiResponse,
      { status: 500 }
    )
  }
}

/**
 * POST /api/posts
 * Creates a new post
 * Requires authentication
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid authorization header' } as ApiResponse,
        { status: 401 }
      )
    }

    const token = authHeader.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid authentication token' } as ApiResponse,
        { status: 401 }
      )
    }

    // Parse request body
    const body: CreatePostRequest = await request.json()

    if (!body.content || body.content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Content is required' } as ApiResponse,
        { status: 400 }
      )
    }

    if (body.content.length > 500) {
      return NextResponse.json(
        { success: false, error: 'Content must be 500 characters or less' } as ApiResponse,
        { status: 400 }
      )
    }

    const { data: post, error } = await createPost(body, user.id)

    if (error) {
      return NextResponse.json(
        { success: false, error } as ApiResponse,
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, data: post } as ApiResponse,
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/posts error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' } as ApiResponse,
      { status: 500 }
    )
  }
}

/**
 * PUT /api/posts
 * Updates an existing post
 * Requires authentication and ownership
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid authorization header' } as ApiResponse,
        { status: 401 }
      )
    }

    const token = authHeader.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid authentication token' } as ApiResponse,
        { status: 401 }
      )
    }

    // Parse request body
    const body: UpdatePostRequest = await request.json()

    if (!body.id) {
      return NextResponse.json(
        { success: false, error: 'Post ID is required' } as ApiResponse,
        { status: 400 }
      )
    }

    if (body.content !== undefined) {
      if (body.content.trim().length === 0) {
        return NextResponse.json(
          { success: false, error: 'Content cannot be empty' } as ApiResponse,
          { status: 400 }
        )
      }

      if (body.content.length > 500) {
        return NextResponse.json(
          { success: false, error: 'Content must be 500 characters or less' } as ApiResponse,
          { status: 400 }
        )
      }
    }

    const { data: post, error } = await updatePost(body, user.id)

    if (error) {
      if (error.includes('not found') || error.includes('unauthorized')) {
        return NextResponse.json(
          { success: false, error } as ApiResponse,
          { status: 404 }
        )
      }
      return NextResponse.json(
        { success: false, error } as ApiResponse,
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, data: post } as ApiResponse,
      { status: 200 }
    )
  } catch (error) {
    console.error('PUT /api/posts error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' } as ApiResponse,
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/posts
 * Deletes a post
 * Requires authentication and ownership
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid authorization header' } as ApiResponse,
        { status: 401 }
      )
    }

    const token = authHeader.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid authentication token' } as ApiResponse,
        { status: 401 }
      )
    }

    // Get post ID from URL search params
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('id')

    if (!postId) {
      return NextResponse.json(
        { success: false, error: 'Post ID is required' } as ApiResponse,
        { status: 400 }
      )
    }

    const { data: success, error } = await deletePost(postId, user.id)

    if (error) {
      if (error.includes('not found') || error.includes('unauthorized')) {
        return NextResponse.json(
          { success: false, error } as ApiResponse,
          { status: 404 }
        )
      }
      return NextResponse.json(
        { success: false, error } as ApiResponse,
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, data: { deleted: success } } as ApiResponse,
      { status: 200 }
    )
  } catch (error) {
    console.error('DELETE /api/posts error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' } as ApiResponse,
      { status: 500 }
    )
  }
}