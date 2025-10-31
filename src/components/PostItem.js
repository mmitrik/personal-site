'use client'

import ReactMarkdown from 'react-markdown'
import { formatTimestamp } from '../../lib/utils'

export default function PostItem({ post, user, onEdit, onDelete }) {
  const isOwner = user && post.author === user.id

  const handleEdit = () => {
    if (onEdit) {
      onEdit(post)
    }
  }

  const handleDelete = () => {
    if (onDelete && window.confirm('Are you sure you want to delete this post?')) {
      onDelete(post.id)
    }
  }

  return (
    <div className="bg-surface rounded-lg border border-border p-4 mb-4 hover:shadow-sm transition-shadow">
      {/* Post content */}
      <div className="prose prose-sm max-w-none mb-3">
        <ReactMarkdown
          components={{
            // Customize markdown rendering
            h1: ({node, ...props}) => <h1 className="text-lg font-bold mb-2 text-text" {...props} />,
            h2: ({node, ...props}) => <h2 className="text-base font-bold mb-2 text-text" {...props} />,
            h3: ({node, ...props}) => <h3 className="text-sm font-bold mb-1 text-text" {...props} />,
            p: ({node, ...props}) => <p className="mb-2 last:mb-0 text-text" {...props} />,
            ul: ({node, ...props}) => <ul className="list-disc list-inside mb-2 text-text" {...props} />,
            ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-2 text-text" {...props} />,
            blockquote: ({node, ...props}) => (
              <blockquote className="border-l-4 border-border pl-3 italic text-muted mb-2" {...props} />
            ),
            code: ({node, inline, ...props}) => 
              inline ? (
                <code className="bg-bg px-1 py-0.5 rounded text-sm border border-border" {...props} />
              ) : (
                <code className="block bg-bg p-2 rounded text-sm overflow-x-auto border border-border" {...props} />
              ),
            a: ({node, ...props}) => (
              <a className="text-accent hover:opacity-70 underline" target="_blank" rel="noopener noreferrer" {...props} />
            ),
          }}
        >
          {post.content}
        </ReactMarkdown>
      </div>

      {/* Post metadata and actions */}
      <div className="flex items-center justify-between text-sm text-muted">
        <div className="flex items-center space-x-2">
          {/* Author info */}
          {post.author && (
            <span className="font-medium">
              {post.author_email || 'Anonymous'}
            </span>
          )}
          
          {/* Timestamp */}
          <span>•</span>
          <time dateTime={post.created_at} title={new Date(post.created_at).toLocaleString()}>
            {formatTimestamp(post.created_at)}
          </time>
          
          {/* Updated indicator */}
          {post.updated_at && post.updated_at !== post.created_at && (
            <>
              <span>•</span>
              <span className="italic">edited</span>
            </>
          )}
        </div>

        {/* Actions for post owner */}
        {isOwner && (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleEdit}
              className="text-accent hover:opacity-70 text-xs font-medium"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="text-red-500 hover:text-red-700 text-xs font-medium"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  )
}