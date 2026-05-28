import { useState, useEffect, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import PostCard from '../components/PostCard'

export default function Explore() {
  const [params, setParams] = useSearchParams()
  const initialQ = params.get('q') || ''
  const [query, setQuery] = useState(initialQ)
  const [posts, setPosts] = useState([])
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const debounce = useRef()

  useEffect(() => {
    if (initialQ) runSearch(initialQ)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function onChange(e) {
    const q = e.target.value
    setQuery(q)
    clearTimeout(debounce.current)
    debounce.current = setTimeout(() => {
      setParams(q ? { q } : {}, { replace: true })
      runSearch(q)
    }, 300)
  }

  async function runSearch(q) {
    const term = q.trim()
    if (!term) { setPosts([]); setProfiles([]); setSearched(false); return }
    setLoading(true)
    setSearched(true)

    const [postsRes, profilesRes] = await Promise.all([
      supabase
        .from('posts')
        .select('*, profiles(id, username, display_name, avatar_url), likes(id, user_id), comments(id)')
        .ilike('content', `%${term}%`)
        .order('created_at', { ascending: false })
        .limit(30),
      supabase
        .from('profiles')
        .select('*')
        .or(`display_name.ilike.%${term}%,username.ilike.%${term}%`)
        .limit(10),
    ])

    setPosts(postsRes.data || [])
    setProfiles(profilesRes.data || [])
    setLoading(false)
  }

  return (
    <div className="explore-page">
      <div className="feed-header explore-header">
        <div className="explore-search">
          <svg viewBox="0 0 24 24" width="18" height="18"><path d="M10.25 3.75c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5c1.795 0 3.419-.726 4.596-1.904 1.178-1.177 1.904-2.801 1.904-4.596 0-3.59-2.91-6.5-6.5-6.5zm-8.5 6.5c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5c0 1.986-.682 3.815-1.814 5.262l4.276 4.276-1.414 1.414-4.276-4.276c-1.448 1.133-3.278 1.814-5.272 1.814-4.694 0-8.5-3.806-8.5-8.5z"/></svg>
          <input
            autoFocus
            className="explore-search-input"
            placeholder="Search posts and people"
            value={query}
            onChange={onChange}
          />
        </div>
      </div>

      {loading && <div className="spinner-wrap"><div className="spinner" /></div>}

      {!loading && !searched && (
        <div className="empty-state"><p>Search for posts and people</p></div>
      )}

      {!loading && searched && profiles.length === 0 && posts.length === 0 && (
        <div className="empty-state"><p>No results for “{query}”</p></div>
      )}

      {profiles.length > 0 && (
        <div className="explore-people">
          <h3 className="explore-section-title">People</h3>
          {profiles.map(p => (
            <Link key={p.id} to={`/profile/${p.username}`} className="person-row">
              <div className="avatar md">
                {p.avatar_url ? <img src={p.avatar_url} alt="" /> : <span>{p.display_name?.[0]?.toUpperCase()}</span>}
              </div>
              <div className="person-info">
                <span className="display-name">{p.display_name}</span>
                <span className="handle">@{p.username}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {posts.length > 0 && (
        <div className="explore-posts">
          <h3 className="explore-section-title">Posts</h3>
          {posts.map(post => <PostCard key={post.id} post={post} onUpdate={() => runSearch(query)} />)}
        </div>
      )}
    </div>
  )
}
