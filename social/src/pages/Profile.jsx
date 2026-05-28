import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import PostCard from '../components/PostCard'

export default function Profile() {
  const { username } = useParams()
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [followerCount, setFollowerCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [username])

  async function load() {
    setLoading(true)
    const { data: prof } = await supabase
      .from('profiles').select('*').eq('username', username).single()

    if (!prof) { setLoading(false); return }
    setProfile(prof)

    const [postsRes, followersRes, followingRes, isFollowRes] = await Promise.all([
      supabase.from('posts')
        .select('*, profiles(*), likes(id, user_id), comments(id)')
        .eq('user_id', prof.id)
        .order('created_at', { ascending: false }),
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', prof.id),
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', prof.id),
      user
        ? supabase.from('follows').select('follower_id').match({ follower_id: user.id, following_id: prof.id }).maybeSingle()
        : Promise.resolve({ data: null }),
    ])

    setPosts(postsRes.data || [])
    setFollowerCount(followersRes.count || 0)
    setFollowingCount(followingRes.count || 0)
    setIsFollowing(!!isFollowRes.data)
    setLoading(false)
  }

  async function toggleFollow() {
    if (!user || profile.id === user.id) return
    if (isFollowing) {
      await supabase.from('follows').delete().match({ follower_id: user.id, following_id: profile.id })
      setIsFollowing(false)
      setFollowerCount(c => c - 1)
    } else {
      await supabase.from('follows').insert({ follower_id: user.id, following_id: profile.id })
      setIsFollowing(true)
      setFollowerCount(c => c + 1)
    }
  }

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>
  if (!profile) return <div className="empty-state"><p>User not found.</p></div>

  const isOwn = user?.id === profile.id

  return (
    <div className="profile-page">
      <div className="feed-header">
        <Link to="/" className="back-btn">
          <svg viewBox="0 0 24 24" width="20" height="20"><path d="M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2H7.414z"/></svg>
        </Link>
        <div>
          <h2>{profile.display_name}</h2>
          <span className="header-sub">{posts.length} posts</span>
        </div>
      </div>

      <div className="profile-banner" />

      <div className="profile-info">
        <div className="profile-top-row">
          <div className="avatar xl">
            {profile.avatar_url
              ? <img src={profile.avatar_url} alt="" />
              : <span>{profile.display_name?.[0]?.toUpperCase()}</span>
            }
          </div>
          {!isOwn && user && (
            <button
              className={`follow-btn${isFollowing ? ' following' : ''}`}
              onClick={toggleFollow}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          )}
        </div>

        <h3 className="profile-display-name">{profile.display_name}</h3>
        <span className="handle">@{profile.username}</span>

        {profile.bio && <p className="profile-bio">{profile.bio}</p>}

        <div className="profile-stats">
          <span><strong>{followingCount}</strong> Following</span>
          <span><strong>{followerCount}</strong> Followers</span>
        </div>
      </div>

      <div className="profile-tabs">
        <button className="tab active">Posts</button>
      </div>

      <div className="profile-feed">
        {posts.length === 0
          ? <div className="empty-state"><p>No posts yet.</p></div>
          : posts.map(post => <PostCard key={post.id} post={post} onUpdate={load} />)
        }
      </div>
    </div>
  )
}
