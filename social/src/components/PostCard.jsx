import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { formatTime } from '../utils/time'

export default function PostCard({ post, onUpdate }) {
  const { user } = useAuth()
  const [liking, setLiking] = useState(false)

  const likeCount = post.likes?.length ?? 0
  const commentCount = post.comments?.length ?? 0
  const isLiked = post.likes?.some(l => l.user_id === user?.id)

  const avatar = post.profiles?.avatar_url
  const displayName = post.profiles?.display_name || post.profiles?.username
  const username = post.profiles?.username

  async function toggleLike() {
    if (!user || liking) return
    setLiking(true)
    if (isLiked) {
      await supabase.from('likes').delete().match({ user_id: user.id, post_id: post.id })
    } else {
      await supabase.from('likes').insert({ user_id: user.id, post_id: post.id })
    }
    onUpdate?.()
    setLiking(false)
  }

  async function deletePost() {
    if (post.user_id !== user?.id) return
    if (!confirm('Delete this post?')) return
    await supabase.from('posts').delete().eq('id', post.id)
    onUpdate?.()
  }

  return (
    <article className="post-card">
      <Link to={`/profile/${username}`} className="post-avatar-link">
        <div className="avatar md">
          {avatar ? <img src={avatar} alt={displayName} /> : <span>{displayName?.[0]?.toUpperCase()}</span>}
        </div>
      </Link>

      <div className="post-body">
        <div className="post-header">
          <Link to={`/profile/${username}`} className="post-author-link">
            <span className="display-name">{displayName}</span>
            <span className="handle">@{username}</span>
          </Link>
          <span className="post-time">· {formatTime(post.created_at)}</span>
          {post.user_id === user?.id && !post._optimistic && (
            <button className="delete-btn" onClick={deletePost} title="Delete post">
              <svg viewBox="0 0 24 24" width="16" height="16"><path d="M16 6V4.5C16 3.12 14.88 2 13.5 2h-3C9.12 2 8 3.12 8 4.5V6H3v2h1.06l.81 11.21C4.98 20.78 6.28 22 7.86 22h8.28c1.58 0 2.88-1.22 3-2.79L19.94 8H21V6h-5zm-6-1.5c0-.28.22-.5.5-.5h3c.28 0 .5.22.5.5V6h-4V4.5zm7.13 15.17c-.04.52-.47.83-.99.83H7.86c-.52 0-.95-.31-.99-.83L6.07 8h11.86l-.8 11.67z"/></svg>
            </button>
          )}
        </div>

        {post.content && <p className="post-content">{post.content}</p>}

        {post.media_urls?.length > 0 && (
          <div className={`post-media count-${Math.min(post.media_urls.length, 4)}`}>
            {post.media_urls.slice(0, 4).map((url, i) =>
              post.media_type === 'video' ? (
                <video key={i} src={url} controls className="media-item" />
              ) : post.media_type === 'audio' ? (
                <audio key={i} src={url} controls className="media-audio" />
              ) : (
                <img key={i} src={url} alt="" className="media-item" />
              )
            )}
          </div>
        )}

        <div className="post-actions">
          <Link to={`/post/${post.id}`} className="action-btn comment-action">
            <svg viewBox="0 0 24 24"><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 7.501 3.58 7.501 8 0 4.421-3.01 8-7.5 8h-1.39l-3.68 3.68c-.24.24-.57.354-.9.354a1.273 1.273 0 01-1.275-1.275V18c-4.421 0-7.126-3.579-7.126-8z"/></svg>
            <span>{commentCount}</span>
          </Link>

          <button
            className={`action-btn like-action${isLiked ? ' liked' : ''}`}
            onClick={toggleLike}
            disabled={!user || !!post._optimistic}
          >
            {isLiked ? (
              <svg viewBox="0 0 24 24"><path d="M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"/></svg>
            ) : (
              <svg viewBox="0 0 24 24"><path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"/></svg>
            )}
            <span>{likeCount}</span>
          </button>
        </div>
      </div>
    </article>
  )
}
