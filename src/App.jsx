import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Layout from './pages/layout'
import { AuthProvider, useAuth } from './lib/auth.jsx'

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <Layout>
      <Routes>
        <Route path="/dashboard" element={<div>Dashboard Page</div>} />
        <Route path="/repair-form" element={<div>Repair Form Page</div>} />
        <Route path="/history" element={<div>History Page</div>} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
