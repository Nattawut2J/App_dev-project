import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { FaTools, FaEnvelope, FaLock, FaFacebook, FaInstagram } from 'react-icons/fa'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (isRegistering) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })
      if (error) {
        setError(error.message)
      } else {
        // Should show success message
        setError('ลงทะเบียนสำเร็จ! กรุณาตรวจสอบอีเมลเพื่อยืนยันตัวตน')
      }
      setLoading(false)
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        setError(error.message)
        setLoading(false)
      } else {
        // Redirect will be handled by auth state change or router logic
        navigate('/dashboard', { replace: true })
      }
    }
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f0f2f5',
      fontFamily: "'Sarabun', sans-serif"
    }}>
      <div style={{
        background: 'white',
        padding: '40px 30px',
        borderRadius: '8px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
        width: '100%',
        maxWidth: '360px',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '20px', color: '#666' }}>
          <FaTools size={40} style={{ border: '2px solid #eee', padding: '10px', borderRadius: '50%' }} />
        </div>
        
        <h2 style={{ 
          margin: '0 0 30px', 
          fontSize: '24px', 
          fontWeight: '500', 
          color: '#333' 
        }}>
          {isRegistering ? 'Sign Up ซ่อมยับ' : 'Login ซ่อมยับ'}
        </h2>

        <form onSubmit={handleLogin}>
          <div style={{ position: 'relative', marginBottom: '15px' }}>
            <div style={{
              position: 'absolute',
              top: '50%',
              right: '15px',
              transform: 'translateY(-50%)',
              color: '#333'
            }}>
              <FaEnvelope />
            </div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 40px 12px 15px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              required
            />
          </div>

          <div style={{ position: 'relative', marginBottom: '25px' }}>
            <div style={{
              position: 'absolute',
              top: '50%',
              right: '15px',
              transform: 'translateY(-50%)',
              color: '#333'
            }}>
              <FaLock />
            </div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 40px 12px 15px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              required
            />
          </div>

          {error && (
            <div style={{ 
              color: error.includes('สำเร็จ') ? 'green' : '#ff4d4f', 
              fontSize: '13px', 
              marginBottom: '15px', 
              textAlign: 'left' 
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: isRegistering ? '#28a745' : '#ff4d4f',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '15px',
              transition: 'background 0.3s'
            }}
          >
            {loading ? 'Processing...' : (isRegistering ? 'Register' : 'Login')}
          </button>

          <div style={{ marginBottom: '20px', fontSize: '14px', color: '#666' }}>
            {isRegistering ? 'มีบัญชีอยู่แล้ว? ' : 'ยังไม่มีบัญชี? '}
            <span 
              onClick={() => {
                setError('')
                setIsRegistering(!isRegistering)
              }}
              style={{ 
                color: '#ff4d4f', 
                cursor: 'pointer', 
                fontWeight: 'bold',
                textDecoration: 'underline'
              }}
            >
              {isRegistering ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
            </span>
          </div>
        </form>

        <div style={{ marginTop: '30px' }}>
          <div style={{ 
            fontSize: '14px', 
            color: '#333', 
            marginBottom: '15px',
            position: 'relative' 
          }}>
            -ติดต่อ-
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            marginTop: '10px'
          }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <FaFacebook size={24} style={{ cursor: 'pointer' }} />
              <FaInstagram size={24} style={{ cursor: 'pointer' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}