'use client'

import { useState } from 'react'
import Header from '../../../components/Header'
import PostInput from '../../../components/PostInput'
import PostList from '../../../components/PostList'
import { useAuth } from '../../../hooks/useAuth'

export default function PostsApp() {
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
      <main className="min-h-screen bg-bg text-text">
        <div className="max-w-4xl mx-auto p-8 pt-16">
          <Header />
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
            <span className="ml-3 text-muted">Loading...</span>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-bg text-text">
      <div className="max-w-4xl mx-auto p-8 pt-16">
        <Header />

        {/* Posts Section */}
        <section className="bg-surface p-10 rounded-2xl shadow-sm">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-heading font-bold text-text mb-4">
              💬 Posts
            </h1>
            <p className="text-muted text-lg">
              Share your thoughts with the world
            </p>
          </div>

          {/* Authentication Section */}
          <div className="mb-8 p-6 bg-bg rounded-lg border border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {user ? (
                  <>
                    <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        {user.email?.[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-text font-medium">Welcome back!</p>
                      <p className="text-muted text-sm">{user.email}</p>
                    </div>
                  </>
                ) : (
                  <div>
                    <p className="text-text font-medium">Ready to share?</p>
                    <p className="text-muted text-sm">Sign in to create posts</p>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-3">
                {user ? (
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Sign Out
                  </button>
                ) : (
                  <button
                    onClick={() => setShowAuthForm(true)}
                    className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:opacity-90 transition-colors"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Auth Modal */}
          {showAuthForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-surface rounded-lg p-6 w-full max-w-md border border-border">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-text">
                    {authMode === 'signin' ? 'Sign In' : 'Sign Up'}
                  </h2>
                  <button
                    onClick={() => setShowAuthForm(false)}
                    className="text-muted hover:text-text"
                  >
                    ×
                  </button>
                </div>
                
                <form onSubmit={handleAuth}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-text mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-3 border border-border rounded-lg bg-bg text-text focus:ring-2 focus:ring-accent focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-text mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full p-3 border border-border rounded-lg bg-bg text-text focus:ring-2 focus:ring-accent focus:border-transparent"
                      required
                    />
                  </div>
                  
                  {authError && (
                    <div className="text-red-500 text-sm mb-4">{authError}</div>
                  )}
                  
                  <button
                    type="submit"
                    className="w-full bg-accent hover:opacity-90 text-white py-2 px-4 rounded-lg font-medium transition-colors"
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
                      className="text-accent hover:opacity-70 text-sm"
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

          {/* Post Input */}
          <div className="mb-8">
            <PostInput
              onPostCreated={handlePostCreated}
              user={user}
            />
          </div>

          {/* Posts List */}
          <PostList
            posts={posts}
            setPosts={setPosts}
            user={user}
          />
        </section>

        {/* Info Section */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-sm">
            <strong>💬 How it Works:</strong> Create an account to start posting! 
            Your posts support Markdown formatting and are stored securely in Supabase. 
            Share your thoughts, ideas, or updates with the community.
          </p>
        </div>

        {/* Version Footer */}
        <footer className="mt-8 text-center">
          <p className="text-muted text-xs">Posts App v1.0</p>
        </footer>
      </div>
    </main>
  )
}