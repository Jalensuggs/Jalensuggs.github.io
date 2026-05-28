import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const MAX_CHARS = 280

export default function ComposeBox({ onPost }) {
  const { user, profile, openAuthModal } = useAuth()
  const [content, setContent] = useState('')
  const [files, setFiles] = useState([])
  const [previews, setPreviews] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const fileRef = useRef()

  if (!user) {
    return (
      <div className="compose-guest">
        <div className="compose-guest-text">
          <strong>Join the conversation</strong>
          <span>Sign in to post, like, and reply.</span>
        </div>
        <button className="post-btn" onClick={openAuthModal}>Sign in</button>
      </div>
    )
  }

  function handleFiles(e) {
    const selected = Array.from(e.target.files).slice(0, 4)
    setFiles(selected)
    setPreviews(selected.map(f => URL.createObjectURL(f)))
    e.target.value = ''
  }

  function removeFile(i) {
    URL.revokeObjectURL(previews[i])
    setFiles(f => f.filter((_, idx) => idx !== i))
    setPreviews(p => p.filter((_, idx) => idx !== i))
  }

  async function uploadFiles(filesToUpload) {
    if (!filesToUpload.length) return []
    const urls = []
    for (const file of filesToUpload) {
      const ext = file.name.split('.').pop()
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from('media').upload(path, file)
      if (!error) {
        const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(path)
        urls.push(publicUrl)
      }
    }
    return urls
  }

  async function handlePost() {
    if (!user || (!content.trim() && !files.length)) return
    setSubmitting(true)

    const postContent = content.trim()
    const mediaType = files.length
      ? files[0].type.startsWith('video') ? 'video'
        : files[0].type.startsWith('audio') ? 'audio'
        : 'image'
      : null
    const filesToUpload = [...files]
    const localPreviews = [...previews]

    const optimisticPost = {
      id: `opt_${Date.now()}`,
      user_id: user.id,
      content: postContent,
      media_urls: localPreviews,
      media_type: mediaType,
      created_at: new Date().toISOString(),
      profiles: {
        id: user.id,
        username: profile?.username,
        display_name: profile?.display_name,
        avatar_url: profile?.avatar_url,
      },
      likes: [],
      comments: [],
      _optimistic: true,
    }

    setContent('')
    previews.forEach(p => URL.revokeObjectURL(p))
    setFiles([])
    setPreviews([])
    setSubmitting(false)

    onPost?.(optimisticPost)

    try {
      const mediaUrls = await uploadFiles(filesToUpload)
      await supabase.from('posts').insert({
        user_id: user.id,
        content: postContent,
        media_urls: mediaUrls,
        media_type: mediaType,
      })
    } finally {
      onPost?.()
    }
  }

  const remaining = MAX_CHARS - content.length
  const canPost = !!(content.trim() || files.length) && remaining >= 0 && !submitting

  return (
    <div className="compose-box">
      <div className="avatar md">
        {profile?.avatar_url
          ? <img src={profile.avatar_url} alt="" />
          : <span>{profile?.display_name?.[0]?.toUpperCase()}</span>
        }
      </div>

      <div className="compose-right">
        <textarea
          className="compose-textarea"
          placeholder="What's happening?!"
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={content.length > 80 ? 4 : 2}
        />

        {previews.length > 0 && (
          <div className={`compose-previews count-${previews.length}`}>
            {previews.map((src, i) => (
              <div key={i} className="preview-wrap">
                {files[i]?.type.startsWith('video')
                  ? <video src={src} className="preview-media" />
                  : files[i]?.type.startsWith('audio')
                  ? <audio src={src} controls className="preview-audio" />
                  : <img src={src} className="preview-media" alt="" />
                }
                <button className="remove-preview" onClick={() => removeFile(i)}>✕</button>
              </div>
            ))}
          </div>
        )}

        <div className="compose-toolbar">
          <div className="compose-tools">
            <button className="tool-btn" onClick={() => fileRef.current?.click()} title="Add image, GIF, video or audio">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,video/*,audio/*,.gif,.mp3"
              multiple
              style={{ display: 'none' }}
              onChange={handleFiles}
            />
          </div>

          <div className="compose-submit">
            {content.length > 0 && (
              <span className={`char-count ${remaining < 20 ? 'warn' : ''} ${remaining < 0 ? 'over' : ''}`}>
                {remaining}
              </span>
            )}
            <button className="post-btn" onClick={handlePost} disabled={!canPost}>
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
