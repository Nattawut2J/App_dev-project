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
      <h2>Profile</h2>
      <div style={{ padding: '16px', border: '1px solid #ccc', borderRadius: 12, marginBottom: 20 }}>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>User ID:</strong> {user.id}
        </p>
      </div>

      <button onClick={handleLogout} style={{ background: '#d33', color: 'white', padding: '10px 16px', borderRadius: 8, border: 'none', cursor: 'pointer' }}>
        Logout
      </button>
    </div>
  )
}
