'use client'

import { useState } from 'react'
import { CHARACTER_LIMIT, getCharacterCountMessage } from '../../lib/utils'
import { createPost } from '../../lib/posts'

export default function PostInput({ onPostCreated, user }) {
  const [content, setContent] = useState('')
  const [isPosting, setIsPosting] = useState(false)
  const [error, setError] = useState('')

  const characterInfo = getCharacterCountMessage(content.length)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!content.trim()) {
      setError('Post content cannot be empty')
      return
    }

    if (!characterInfo.canPost) {
      setError('Post exceeds character limit')
      return
    }

    if (!user) {
      setError('You must be logged in to post')
      return
    }

    setIsPosting(true)
    setError('')

    try {
      const { data: newPost, error } = await createPost({ content: content.trim() }, user.id)
      
      if (error) {
        setError(error)
        return
      }
      
      setContent('')
      
      // Notify parent component of new post
      if (onPostCreated && newPost) {
        onPostCreated(newPost)
      }
    } catch (err) {
      setError(err.message || 'Failed to create post')
    } finally {
      setIsPosting(false)
    }
  }

  const handleContentChange = (e) => {
    setContent(e.target.value)
    setError('') // Clear error when user starts typing
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="post-content" className="block text-sm font-medium text-gray-700 mb-2">
            What&apos;s on your mind?
          </label>
          <textarea
            id="post-content"
            value={content}
            onChange={handleContentChange}
            placeholder="Share your thoughts... (Markdown supported)"
            className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            rows={4}
            maxLength={CHARACTER_LIMIT + 100} // Allow slight overflow for better UX
          />
        </div>

        {/* Character count */}
        {characterInfo.message && (
          <div className={`text-sm mb-3 ${characterInfo.isError ? 'text-red-500' : 'text-gray-500'}`}>
            {characterInfo.message}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="text-red-500 text-sm mb-3">
            {error}
          </div>
        )}

        {/* Auth status */}
        {!user && (
          <div className="text-yellow-600 text-sm mb-3">
            You need to be logged in to post messages
          </div>
        )}

        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-400">
            Markdown formatting supported
          </div>
          
          <button
            type="submit"
            disabled={!characterInfo.canPost || !content.trim() || isPosting || !user}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              !characterInfo.canPost || !content.trim() || !user
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : isPosting
                ? 'bg-blue-400 text-white cursor-wait'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {isPosting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  )
}