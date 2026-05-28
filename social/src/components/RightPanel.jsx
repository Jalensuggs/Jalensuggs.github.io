export default function RightPanel() {
  return (
    <aside className="right-panel">
      <div className="search-bar">
        <svg viewBox="0 0 24 24" width="18" height="18"><path d="M10.25 3.75c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5c1.795 0 3.419-.726 4.596-1.904 1.178-1.177 1.904-2.801 1.904-4.596 0-3.59-2.91-6.5-6.5-6.5zm-8.5 6.5c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5c0 1.986-.682 3.815-1.814 5.262l4.276 4.276-1.414 1.414-4.276-4.276c-1.448 1.133-3.278 1.814-5.272 1.814-4.694 0-8.5-3.806-8.5-8.5z"/></svg>
        <span>Search</span>
      </div>

      <div className="right-card">
        <h3>Subscribe to Premium</h3>
        <p>Subscribe to unlock new features and get a blue checkmark if eligible.</p>
        <button className="premium-btn">Subscribe</button>
      </div>
    </aside>
  )
}
