import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/auth'
import { useNavigate } from 'react-router-dom'
import { FaUserCircle } from 'react-icons/fa'

export default function Profile() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    let ignore = false
    async function getProfile() {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`username, avatar_url`)
        .eq('id', user.id)
        .single()

      if (!ignore && data) {
        setUsername(data.username || '')
        setAvatarUrl(data.avatar_url || null)
      }
      setLoading(false)
    }

    if (user) getProfile()

    return () => {
      ignore = true
    }
  }, [user])

  async function updateProfile({ username, avatar_url }) {
    setLoading(true)

    const updates = {
      id: user.id,
      username,
      avatar_url,
      // updated_at: new Date(), // column might not exist
    }

    const { error } = await supabase.from('profiles').upsert(updates)

    if (error) {
      alert(error.message)
    } else {
      setIsEditing(false)
    }
    setLoading(false)
  }

  async function uploadAvatar(event) {
    try {
      setUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      }

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
      
      setAvatarUrl(data.publicUrl)
      // Auto update profile with new avatar
      // updateProfile({ username, avatar_url: data.publicUrl })
      
    } catch (error) {
      alert(error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleLogout = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  const AvatarDisplay = ({ url, size = 150 }) => {
    if (url) {
      return (
        <img
          src={url}
          alt="Avatar"
          style={{
            height: size,
            width: size,
            borderRadius: '50%',
            objectFit: 'cover',
            border: '4px solid #000'
          }}
        />
      )
    }
    return <FaUserCircle size={size} />
  }

  if (!user) return null

  return (
    <div style={{ backgroundColor: '#f5f5f5', minHeight: 'calc(100vh - 60px)', padding: '20px' }}>
      <h2 style={{ fontSize: '24px', marginBottom: '20px', color: '#333' }}>
        {isEditing ? 'แก้ไขโปรไฟล์' : 'Profile'}
      </h2>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Main Card */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          padding: '40px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          width: '100%',
          maxWidth: '500px'
        }}>
          {!isEditing ? (
            // View Mode
            <div>
              <div style={{ marginBottom: '10px', fontSize: '18px', color: '#333' }}>
                Welcome, {username || user.email}!
              </div>
              
              <div style={{ 
                border: '1px solid #e0e0e0', 
                borderRadius: '8px', 
                padding: '20px',
                marginBottom: '20px',
                textAlign: 'center'
              }}>
                <div style={{ marginBottom: '20px' }}>
                  <AvatarDisplay url={avatarUrl} />
                </div>
                <div style={{ textAlign: 'left', fontSize: '16px' }}>
                  <strong>ชื่อ:</strong> {username || '-'}
                </div>
              </div>

              <button
                onClick={() => setIsEditing(true)}
                style={{
                  backgroundColor: '#4caf50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '10px 20px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  marginBottom: '10px',
                  width: '100%'
                }}
              >
                แก้ไขโปรไฟล์
              </button>
              
              <button
                onClick={handleLogout}
                style={{
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '10px 20px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                ออกจากระบบ
              </button>
            </div>
          ) : (
            // Edit Mode
            <div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>ชื่อ</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ 
                border: '1px solid #e0e0e0', 
                borderRadius: '8px', 
                padding: '20px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '20px'
              }}>
                <div>
                  <AvatarDisplay url={avatarUrl} size={80} />
                </div>
                <div>
                   <label 
                     htmlFor="avatar-upload" 
                     style={{
                       backgroundColor: '#fff',
                       border: '1px solid #ccc',
                       padding: '8px 16px',
                       borderRadius: '4px',
                       cursor: 'pointer',
                       fontSize: '14px',
                       display: 'inline-block'
                     }}
                   >
                     {uploading ? 'กำลังอัปโหลด...' : 'เลือกไฟล์'}
                   </label>
                   <input
                     id="avatar-upload"
                     type="file"
                     accept="image/*"
                     onChange={uploadAvatar}
                     disabled={uploading}
                     style={{ display: 'none' }}
                   />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => updateProfile({ username, avatar_url: avatarUrl })}
                  disabled={loading}
                  style={{
                    backgroundColor: '#4caf50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '10px 20px',
                    fontSize: '16px',
                    cursor: 'pointer',
                    flex: 1
                  }}
                >
                  {loading ? 'บันทึก...' : 'บันทึก'}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  style={{
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '10px 20px',
                    fontSize: '16px',
                    cursor: 'pointer',
                    flex: 1
                  }}
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

