import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    navigate('/profile', { replace: true })
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
      } else {
        setError('สมัครสมาชิกสำเร็จ! กรุณาเช็คอีเมลเพื่อยืนยัน')
      }
    } catch (err) {
      console.error('Sign-up failed:', err)
      setError(err?.message ?? 'Failed to fetch')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
      <h2>ระบบแจ้งซ่อม (Login)</h2>
      <form>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ display: 'block', width: '100%', marginBottom: '10px' }} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ display: 'block', width: '100%', marginBottom: '10px' }} />
        {error && <div style={{ color: error.includes('สำเร็จ') ? 'green' : 'red', marginBottom: 10 }}>{error}</div>}
        <button onClick={handleLogin} disabled={loading} style={{ marginRight: '10px' }}>
          {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
        </button>
        <button onClick={handleSignUp} disabled={loading}>
          สมัครสมาชิก
        </button>
      </form>
    </div>
  )
}