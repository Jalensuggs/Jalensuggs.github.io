import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const MAX_CHARS = 280

export default function ComposeBox({ onPost }) {
  const { user, profile } = useAuth()
  const [content, setContent] = useState('')
  const [files, setFiles] = useState([])
  const [previews, setPreviews] = useState([])
  const [posting, setPosting] = useState(false)
  const fileRef = useRef()

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

  async function uploadMedia() {
    if (!files.length) return []
    const urls = []
    for (const file of files) {
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
    if (!content.trim() && !files.length) return
    setPosting(true)

    const mediaUrls = await uploadMedia()
    const mediaType = files.length
      ? files[0].type.startsWith('video') ? 'video' : 'image'
      : null

    await supabase.from('posts').insert({
      user_id: user.id,
      content: content.trim(),
      media_urls: mediaUrls,
      media_type: mediaType
    })

    setContent('')
    previews.forEach(p => URL.revokeObjectURL(p))
    setFiles([])
    setPreviews([])
    setPosting(false)
    onPost?.()
  }

  const remaining = MAX_CHARS - content.length
  const canPost = (content.trim() || files.length) && remaining >= 0 && !posting

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
                  : <img src={src} className="preview-media" alt="" />
                }
                <button className="remove-preview" onClick={() => removeFile(i)}>✕</button>
              </div>
            ))}
          </div>
        )}

        <div className="compose-toolbar">
          <div className="compose-tools">
            <button className="tool-btn" onClick={() => fileRef.current?.click()} title="Add image or video">
              <svg viewBox="0 0 24 24" width="20" height="20"><path d="M3 5.5C3 4.119 4.119 3 5.5 3h13C19.881 3 21 4.119 21 5.5v13c0 1.381-1.119 2.5-2.5 2.5h-13C4.119 21 3 19.881 3 18.5v-13zM5.5 5c-.276 0-.5.224-.5.5v9.086l3-3 3 3 1-1 3 3H18.5c.276 0 .5-.224.5-.5v-13c0-.276-.224-.5-.5-.5h-13zM12 10.5a2 2 0 110-4 2 2 0 010 4z"/></svg>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,video/*"
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
              {posting ? 'Posting…' : 'Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
