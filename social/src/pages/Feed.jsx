import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import ComposeBox from '../components/ComposeBox'
import PostCard from '../components/PostCard'

export default function Feed() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchPosts() }, [])

  async function fetchPosts() {
    const { data } = await supabase
      .from('posts')
      .select('*, profiles(id, username, display_name, avatar_url), likes(id, user_id), comments(id)')
      .order('created_at', { ascending: false })
      .limit(50)
    setPosts(data || [])
    setLoading(false)
  }

  return (
    <div className="feed">
      <div className="feed-header">
        <h2>Home</h2>
      </div>

      <ComposeBox onPost={fetchPosts} />
      <div className="divider" />

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <p>No posts yet.</p>
          <p className="empty-sub">Be the first to post something!</p>
        </div>
      ) : (
        posts.map(post => <PostCard key={post.id} post={post} onUpdate={fetchPosts} />)
      )}
    </div>
  )
}
