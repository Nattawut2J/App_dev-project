import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import Profile from './pages/Profile'
import { AuthProvider, useAuth } from './lib/auth.jsx'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>
  if (!user) return <Navigate to="/login" replace />

  return children
}

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/profile" replace /> : <Login />} />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to={user ? '/profile' : '/login'} replace />} />
    </Routes>
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
