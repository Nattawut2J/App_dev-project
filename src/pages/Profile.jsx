import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'

export default function Profile() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  if (!user) {
    return null
  }

  return (
    <div style={{ padding: '20px', maxWidth: '480px', margin: 'auto' }}>
      <h2 className="profile-title">Profile
        <div style={{color: '#130d0d', fontSize: '14px', marginTop: '4px'}}>Welcome! {user.email}</div>
      </h2>
      <div style={{ padding: '16px', border: '1px solid #646f7a', borderRadius: 12, marginBottom: 20 }}>
        <p className="user-info">
          <strong>Email:</strong> {user.email}
        </p>
        <p className="user-info">
          <strong>User ID:</strong> {user.id}
        </p>
      </div>

      <button onClick={handleLogout} style={{ background: '#d33', color: 'white', padding: '10px 16px', borderRadius: 8, border: 'none', cursor: 'pointer' }}>
        Logout
      </button>
    </div>
  )
}
