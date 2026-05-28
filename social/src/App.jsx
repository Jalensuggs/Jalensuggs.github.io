import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Auth from './pages/Auth'
import Feed from './pages/Feed'
import Profile from './pages/Profile'
import PostDetail from './pages/PostDetail'

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="full-screen-center">
        <div className="spinner" />
      </div>
    )
  }

  if (!user) return <Auth />

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Feed />} />
        <Route path="/profile/:username" element={<Profile />} />
        <Route path="/post/:id" element={<PostDetail />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
