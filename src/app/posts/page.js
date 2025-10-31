'use client'

import { useState } from 'react'
import PostInput from '../../components/PostInput'
import PostList from '../../components/PostList'
import { useAuth } from '../../hooks/useAuth'

export default function PostsPage() {
  const [posts, setPosts] = useState([])
  const { user, loading, signIn, signUp, signOut, getAccessToken } = useAuth()
  const [showAuthForm, setShowAuthForm] = useState(false)
  const [authMode, setAuthMode] = useState('signin') // 'signin' or 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')

  const handlePostCreated = (newPost) => {
    // Add the new post to the beginning of the list (newest first)
    setPosts(prevPosts => [newPost, ...prevPosts])
  }

  const handleAuth = async (e) => {
    e.preventDefault()
    setAuthError('')

    if (!email || !password) {
      setAuthError('Email and password are required')
      return
    }

    try {
      let result
      if (authMode === 'signin') {
        result = await signIn(email, password)
      } else {
        result = await signUp(email, password)
      }

      if (result.error) {
        setAuthError(result.error.message)
      } else {
        setShowAuthForm(false)
        setEmail('')
        setPassword('')
        if (authMode === 'signup') {
          setAuthError('Check your email to confirm your account!')
        }
      }
    } catch (error) {
      setAuthError(error.message)
    }
  }

  const handleLogout = async () => {
    await signOut()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Posts</h1>
              <p className="text-gray-600 mt-1">Share your thoughts with the world</p>
            </div>
            
            {/* Auth controls */}
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">
                    Welcome, <span className="font-medium">{user.email}</span>
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-red-600 hover:text-red-800 font-medium"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthForm(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Auth modal */}
        {showAuthForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {authMode === 'signin' ? 'Sign In' : 'Sign Up'}
                </h2>
                <button
                  onClick={() => setShowAuthForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleAuth}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                {authError && (
                  <div className="text-red-500 text-sm mb-4">{authError}</div>
                )}
                
                <button
                  type="submit"
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  {authMode === 'signin' ? 'Sign In' : 'Sign Up'}
                </button>
                
                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode(authMode === 'signin' ? 'signup' : 'signin')
                      setAuthError('')
                    }}
                    className="text-blue-500 hover:text-blue-700 text-sm"
                  >
                    {authMode === 'signin' 
                      ? "Don't have an account? Sign up"
                      : "Already have an account? Sign in"
                    }
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <PostInput
          onPostCreated={handlePostCreated}
          user={user}
        />

        {/* Posts list */}
        <PostList
          posts={posts}
          setPosts={setPosts}
          user={user}
        />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center text-gray-500 text-sm">
          <p>Micro-blogging platform built with Next.js and Supabase</p>
          <p className="mt-2">
            <strong>Production Ready:</strong> Posts are stored in Supabase with full authentication.
          </p>
        </div>
      </footer>
    </div>
  )
}