import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function RightPanel() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [trending, setTrending] = useState([])

  useEffect(() => { fetchTrending() }, [])

  async function fetchTrending() {
    const { data } = await supabase
      .from('posts')
      .select('id, content, media_type, profiles(username, display_name), likes(id)')
      .order('created_at', { ascending: false })
      .limit(100)
    const ranked = (data || [])
      .map(p => ({ ...p, likeCount: p.likes?.length ?? 0 }))
      .sort((a, b) => b.likeCount - a.likeCount)
      .slice(0, 5)
    setTrending(ranked)
  }

  function onSubmit(e) {
    e.preventDefault()
    if (query.trim()) navigate(`/explore?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <aside className="right-panel">
      <form className="search-bar" onSubmit={onSubmit}>
        <svg viewBox="0 0 24 24" width="18" height="18"><path d="M10.25 3.75c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5c1.795 0 3.419-.726 4.596-1.904 1.178-1.177 1.904-2.801 1.904-4.596 0-3.59-2.91-6.5-6.5-6.5zm-8.5 6.5c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5c0 1.986-.682 3.815-1.814 5.262l4.276 4.276-1.414 1.414-4.276-4.276c-1.448 1.133-3.278 1.814-5.272 1.814-4.694 0-8.5-3.806-8.5-8.5z"/></svg>
        <input
          className="search-bar-input"
          placeholder="Search"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </form>

      <div className="right-card trending-card">
        <h3>Trending</h3>
        {trending.length === 0 ? (
          <p className="trending-empty">No posts yet</p>
        ) : (
          trending.map((p, i) => (
            <Link key={p.id} to={`/post/${p.id}`} className="trending-item">
              <span className="trending-rank">{i + 1}</span>
              <div className="trending-body">
                <span className="trending-author">{p.profiles?.display_name || p.profiles?.username}</span>
                <span className="trending-text">
                  {p.content
                    ? p.content.slice(0, 60)
                    : p.media_type === 'video' ? '🎬 Video' : '🖼 Photo'}
                </span>
                <span className="trending-likes">♥ {p.likeCount}</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </aside>
  )
}
