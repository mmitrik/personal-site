'use client'

import { useState, useEffect } from 'react'
import PostItem from './PostItem'
import { getPosts, updatePost, deletePost } from '../../lib/posts'

export default function PostList({ posts, setPosts, user }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const refreshPosts = async () => {
    setLoading(true)
    setError('')
    
    try {
      const { data: fetchedPosts, error } = await getPosts()
      
      if (error) {
        setError('Failed to load posts: ' + error)
        return
      }
      
      setPosts(fetchedPosts || [])
    } catch (err) {
      setError('Failed to load posts: ' + (err.message || 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (post) => {
    // For now, just prompt for new content
    // In a real app, you might open a modal or inline editor
    const newContent = window.prompt('Edit your post:', post.content)
    
    if (newContent !== null && newContent.trim() !== post.content) {
      handleUpdate(post.id, newContent.trim())
    }
  }

  const handleUpdate = async (postId, newContent) => {
    if (!user) {
      setError('Authentication required')
      return
    }

    try {
      const { data: updatedPost, error } = await updatePost({ id: postId, content: newContent }, user.id)
      
      if (error) {
        setError('Failed to update post: ' + error)
        return
      }
      
      // Update the post in the local state
      if (updatedPost) {
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post.id === postId ? updatedPost : post
          )
        )
      }
    } catch (err) {
      setError('Failed to update post: ' + (err.message || 'Unknown error'))
    }
  }

  const handleDelete = async (postId) => {
    if (!user) {
      setError('Authentication required')
      return
    }

    try {
      const { data: success, error } = await deletePost(postId, user.id)
      
      if (error) {
        setError('Failed to delete post: ' + error)
        return
      }
      
      if (success) {
        // Remove the post from local state
        setPosts(prevPosts => prevPosts.filter(post => post.id !== postId))
      }
    } catch (err) {
      setError('Failed to delete post: ' + (err.message || 'Unknown error'))
    }
  }

  // Initial load
  useEffect(() => {
    refreshPosts()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading && posts.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Loading posts...</span>
      </div>
    )
  }

  return (
    <div>
      {/* Error display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          <div className="flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={() => setError('')}
              className="text-red-500 hover:text-red-700 font-medium"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Refresh button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-text">
          Recent Posts
          {posts.length > 0 && (
            <span className="text-sm font-normal text-muted ml-2">
              ({posts.length} post{posts.length !== 1 ? 's' : ''})
            </span>
          )}
        </h2>
        
        <button
          onClick={refreshPosts}
          disabled={loading}
          className="flex items-center px-3 py-2 text-sm text-muted hover:text-text disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh
        </button>
      </div>

      {/* Posts list */}
      {posts.length === 0 && !loading ? (
        <div className="text-center py-12">
          <div className="text-muted mb-4">
            <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-lg font-medium text-text">No posts yet</p>
            <p className="text-sm">Be the first to share something!</p>
          </div>
        </div>
      ) : (
        <div className="space-y-1">
          {posts.map((post) => (
            <PostItem
              key={post.id}
              post={post}
              user={user}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Loading indicator for refresh */}
      {loading && posts.length > 0 && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent"></div>
        </div>
      )}
    </div>
  )
}