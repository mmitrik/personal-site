# Posts App - Micro-Blogging Platform

## Overview
A full-featured micro-blogging platform with user authentication, markdown support, and real-time posts. Built with Next.js App Router, Supabase for backend, and integrated with the site's design system.

## Features
- ✅ User authentication (sign up/sign in/sign out)
- ✅ Create, edit, and delete posts
- ✅ Markdown support in posts
- ✅ Character counting with validation (1024 character limit)
- ✅ Real-time post updates
- ✅ Responsive design matching site theme
- ✅ Secure backend with Supabase and Row Level Security

## Technical Stack
- **Frontend:** Next.js 15 (App Router), React 19
- **Backend:** Supabase (PostgreSQL + Auth)
- **Styling:** Tailwind CSS with site design system
- **Markdown:** react-markdown
- **Date Formatting:** date-fns

## Database Schema
```sql
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL CHECK (char_length(content) > 0 AND char_length(content) <= 500),
  author UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Key Components
- **PostInput** - Text input with character counting and validation
- **PostList** - Displays posts in reverse chronological order
- **PostItem** - Individual post with markdown rendering
- **useAuth** - Custom hook for Supabase authentication

## Environment Variables Required
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Usage
Navigate to `/apps/posts` or access through Projects page. Users must authenticate to create posts. All posts support markdown formatting and are stored securely in Supabase.

## Future Enhancements
- [ ] Fix discrepancy in UX and in DB for post length 
- [ ] Add user profile so posts don't appear to be from Anonymous
- [ ] Research deeper into how account creation works, along with validation process
- [ ] Extend database backend to support features for other projects (i.e. leaderboard in games)
- [ ] Change post editing UX to use inline text box, not a popup
- [ ] Post reactions/likes
- [ ] User profiles
- [ ] Post categories/tags
- [ ] Image upload support
- [ ] Real-time notifications