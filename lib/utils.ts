import { formatDistance, isWithinInterval, subWeeks, format } from 'date-fns'

/**
 * Format timestamp for display
 * Recent posts (within 1 week): "2 hours ago", "3 days ago"
 * Older posts: "Jan 15, 2024 at 3:30 PM"
 */
export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const oneWeekAgo = subWeeks(now, 1)

  // Check if the date is within the last week
  if (isWithinInterval(date, { start: oneWeekAgo, end: now })) {
    return formatDistance(date, now, { addSuffix: true })
  } else {
    return format(date, 'MMM d, yyyy \'at\' h:mm a')
  }
}

// API client functions have been moved to lib/posts.ts for better organization
// Import { getPosts, createPost, updatePost, deletePost } from '@/lib/posts' instead

/**
 * Character count utilities
 */
export const CHARACTER_LIMIT = 1024
export const WARNING_THRESHOLD = 100 // Show warning when 100 chars remaining

export function getCharacterCountMessage(length: number): {
  message: string
  isError: boolean
  canPost: boolean
} {
  const remaining = CHARACTER_LIMIT - length
  
  if (remaining < 0) {
    return {
      message: `${Math.abs(remaining)} characters over limit`,
      isError: true,
      canPost: false
    }
  } else if (remaining <= WARNING_THRESHOLD) {
    return {
      message: `${remaining} characters remaining`,
      isError: false,
      canPost: true
    }
  }
  
  return {
    message: '',
    isError: false,
    canPost: true
  }
}