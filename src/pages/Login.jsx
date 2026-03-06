import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) alert(error.message)
    else alert('เข้าสู่ระบบสำเร็จ!')
    setLoading(false)
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) alert(error.message)
    else alert('สมัครสมาชิกสำเร็จ! กรุณาเช็คอีเมลเพื่อยืนยัน')
    setLoading(false)
  }

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
      <h2>ระบบแจ้งซ่อม (Login)</h2>
      <form>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ display: 'block', width: '100%', marginBottom: '10px' }} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ display: 'block', width: '100%', marginBottom: '10px' }} />
        <button onClick={handleLogin} disabled={loading} style={{ marginRight: '10px' }}>เข้าสู่ระบบ</button>
        <button onClick={handleSignUp} disabled={loading}>สมัครสมาชิก</button>
      </form>
    </div>
  )
}