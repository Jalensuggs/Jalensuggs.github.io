import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import PostCard from '../components/PostCard'
import { formatTime } from '../utils/time'

export default function PostDetail() {
  const { id } = useParams()
  const { user, profile } = useAuth()
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [content, setContent] = useState('')
  const [posting, setPosting] = useState(false)

  useEffect(() => { load() }, [id])

  async function load() {
    const [postRes, commentsRes] = await Promise.all([
      supabase.from('posts')
        .select('*, profiles(*), likes(id, user_id), comments(id)')
        .eq('id', id).single(),
      supabase.from('comments')
        .select('*, profiles(*)')
        .eq('post_id', id)
        .order('created_at', { ascending: true })
    ])
    setPost(postRes.data)
    setComments(commentsRes.data || [])
  }

  async function handleComment(e) {
    e.preventDefault()
    if (!content.trim() || !user) return
    setPosting(true)
    await supabase.from('comments').insert({ user_id: user.id, post_id: id, content: content.trim() })
    setContent('')
    setPosting(false)
    load()
  }

  if (!post) return <div className="spinner-wrap"><div className="spinner" /></div>

  return (
    <div className="post-detail">
      <div className="feed-header">
        <Link to="/" className="back-btn">
          <svg viewBox="0 0 24 24" width="20" height="20"><path d="M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2H7.414z"/></svg>
        </Link>
        <h2>Post</h2>
      </div>

      <PostCard post={post} onUpdate={load} />

      {user && (
        <form className="reply-form" onSubmit={handleComment}>
          <div className="avatar sm">
            {profile?.avatar_url
              ? <img src={profile.avatar_url} alt="" />
              : <span>{profile?.display_name?.[0]?.toUpperCase()}</span>
            }
          </div>
          <input
            className="reply-input"
            placeholder="Post your reply"
            value={content}
            onChange={e => setContent(e.target.value)}
          />
          <button className="post-btn sm" type="submit" disabled={!content.trim() || posting}>
            Reply
          </button>
        </form>
      )}

      <div className="divider" />

      <div className="comments-list">
        {comments.map(c => (
          <div key={c.id} className="comment-card">
            <Link to={`/profile/${c.profiles?.username}`} className="avatar md">
              {c.profiles?.avatar_url
                ? <img src={c.profiles.avatar_url} alt="" />
                : <span>{c.profiles?.display_name?.[0]?.toUpperCase()}</span>
              }
            </Link>
            <div className="comment-body">
              <div className="comment-header">
                <Link to={`/profile/${c.profiles?.username}`} className="display-name">{c.profiles?.display_name}</Link>
                <span className="handle">@{c.profiles?.username}</span>
                <span className="post-time">· {formatTime(c.created_at)}</span>
              </div>
              <p className="comment-content">{c.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
