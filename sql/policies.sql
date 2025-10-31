-- =====================================================
-- Micro-Blogging Platform - Database Setup
-- =====================================================
-- This file contains the SQL commands to set up your 
-- Supabase database for the micro-blogging platform.
-- Run these commands in the Supabase SQL Editor.

-- =====================================================
-- 1. CREATE THE POSTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL CHECK (char_length(content) > 0 AND char_length(content) <= 500),
  author UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS posts_created_at_idx ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS posts_author_idx ON posts(author);

-- =====================================================
-- 2. ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 3. RLS POLICIES
-- =====================================================

-- Policy: Anyone can read posts (public reading)
CREATE POLICY "Anyone can read posts" ON posts
  FOR SELECT USING (true);

-- Policy: Users can insert their own posts
CREATE POLICY "Users can insert own posts" ON posts
  FOR INSERT WITH CHECK (auth.uid() = author);

-- Policy: Users can update their own posts
CREATE POLICY "Users can update own posts" ON posts
  FOR UPDATE USING (auth.uid() = author);

-- Policy: Users can delete their own posts
CREATE POLICY "Users can delete own posts" ON posts
  FOR DELETE USING (auth.uid() = author);

-- =====================================================
-- 4. ALTERNATIVE POLICIES (Commented out)
-- =====================================================
-- Uncomment and modify these policies based on your needs:

-- Policy: Only authenticated users can read posts
-- DROP POLICY IF EXISTS "Anyone can read posts" ON posts;
-- CREATE POLICY "Authenticated users can read posts" ON posts
--   FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Admins can manage all posts
-- CREATE POLICY "Admins can manage all posts" ON posts
--   FOR ALL USING (
--     auth.jwt() ->> 'role' = 'admin' OR 
--     auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin'
--   );

-- Policy: Moderators can delete any post
-- CREATE POLICY "Moderators can delete any post" ON posts
--   FOR DELETE USING (
--     auth.jwt() ->> 'role' IN ('admin', 'moderator') OR
--     auth.uid() = author
--   );

-- =====================================================
-- 5. FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to call the function before updates
CREATE TRIGGER update_posts_updated_at 
  BEFORE UPDATE ON posts 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. SAMPLE DATA (Optional)
-- =====================================================
-- Uncomment to insert some sample posts:

-- INSERT INTO posts (content, author) VALUES
-- ('Welcome to our micro-blogging platform! 🚀', auth.uid()),
-- ('This is a sample post to test the functionality.', auth.uid()),
-- ('TypeScript + Next.js + Supabase = ❤️', auth.uid());

-- =====================================================
-- 7. USEFUL QUERIES FOR DEVELOPMENT
-- =====================================================

-- View all posts with author information
-- SELECT 
--   p.*,
--   u.email as author_email
-- FROM posts p
-- LEFT JOIN auth.users u ON p.author = u.id
-- ORDER BY p.created_at DESC;

-- Count posts by author
-- SELECT 
--   u.email,
--   COUNT(p.id) as post_count
-- FROM auth.users u
-- LEFT JOIN posts p ON u.id = p.author
-- GROUP BY u.id, u.email
-- ORDER BY post_count DESC;