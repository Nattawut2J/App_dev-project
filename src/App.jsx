import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import Profile from './pages/Profile'
import RepairForm from './pages/RepairForm'
import EditRepairForm from './pages/EditRepairForm'
import RepairHistory from './pages/RepairHistory'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/AdminDashboard'
import TechnicianDashboard from './pages/TechnicianDashboard'
import Layout from './pages/layout'
import { AuthProvider, useAuth } from './lib/auth.jsx'

function ProtectedRoute({ children, allowedRoles }) {
  const { user, userRole, loading } = useAuth()
  if (loading) return <div style={{ padding: 20 }}>กำลังโหลด...</div>
  if (!user) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/dashboard" replace />
  }
  return children
}

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
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/repair-form" element={<RepairForm />} />
        <Route path="/repair-form/edit/:id" element={<EditRepairForm />} />
        <Route path="/history" element={<RepairHistory />} />
        <Route path="/profile" element={<Profile />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/technician"
          element={
            <ProtectedRoute allowedRoles={['technician', 'admin']}>
              <TechnicianDashboard />
            </ProtectedRoute>
          }
        />
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
