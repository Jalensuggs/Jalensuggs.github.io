import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import ComposeBox from '../components/ComposeBox'
import PostCard from '../components/PostCard'

const POST_SELECT =
  '*, profiles(id, username, display_name, avatar_url), likes(id, user_id), comments(id)'

export default function Feed() {
  const { user } = useAuth()
  const [tab, setTab] = useState('forYou')
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    try {
      if (tab === 'following') {
        const { data: follows } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', user?.id)
        const ids = (follows || []).map(f => f.following_id)

        if (ids.length === 0) {
          setPosts([])
          return
        }

        const { data } = await supabase
          .from('posts')
          .select(POST_SELECT)
          .in('user_id', ids)
          .order('created_at', { ascending: false })
          .limit(50)
        setPosts(data || [])
      } else {
        const { data } = await supabase
          .from('posts')
          .select(POST_SELECT)
          .order('created_at', { ascending: false })
          .limit(100)
        const ranked = (data || [])
          .map(p => ({ ...p, likeCount: p.likes?.length ?? 0 }))
          .sort((a, b) => b.likeCount - a.likeCount || new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 50)
        setPosts(ranked)
      }
    } catch {
      setPosts([])
    } finally {
      setLoading(false)
    }
  }, [tab, user?.id])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  function handleNewPost(optimisticPost) {
    if (optimisticPost) {
      // Show immediately; filter out any stale optimistic posts first
      setPosts(prev => [optimisticPost, ...prev.filter(p => !p._optimistic)])
    } else {
      fetchPosts()
    }
  }

  return (
    <div className="feed">
      <div className="feed-header feed-header-tabs">
        <button
          className={`feed-tab${tab === 'forYou' ? ' active' : ''}`}
          onClick={() => setTab('forYou')}
        >
          For You
        </button>
        <button
          className={`feed-tab${tab === 'following' ? ' active' : ''}`}
          onClick={() => setTab('following')}
        >
          Following
        </button>
      </div>

      <ComposeBox onPost={handleNewPost} />
      <div className="divider" />

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : posts.length === 0 ? (
        <div className="empty-state">
          {tab === 'following' ? (
            <>
              <p>No posts from people you follow.</p>
              <p className="empty-sub">Follow some people to see their posts here.</p>
            </>
          ) : (
            <>
              <p>No posts yet.</p>
              <p className="empty-sub">Be the first to post something!</p>
            </>
          )}
        </div>
      ) : (
        posts.map(post => <PostCard key={post.id} post={post} onUpdate={fetchPosts} />)
      )}
    </div>
  )
}
