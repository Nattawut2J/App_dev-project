import { useState } from 'react'
import { useAuth } from '../lib/auth.jsx'
import { supabase } from '../lib/supabaseClient'

export default function RepairForm() {
  const { user } = useAuth()

  const [name, setName] = useState('')
  const [deviceType, setDeviceType] = useState('')
  const [deviceModel, setDeviceModel] = useState('')
  const [issue, setIssue] = useState('')
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')

    if (!name || !deviceType || !deviceModel || !issue || !address) {
      setMessage('กรุณากรอกข้อมูลให้ครบทุกช่อง')
      return
    }

    setLoading(true)
    const { data, error } = await supabase.from('repair_requests').insert([
      {
        user_id: user?.id,
        client_name: name,
        device_type: deviceType,
        device_model: deviceModel,
        issue,
        address,
        status: 'pending',
      },
    ])

    setLoading(false)

    if (error) {
      console.error('Insert error:', error)
      setMessage('เกิดข้อผิดพลาดในการบันทึก กรุณาลองอีกครั้ง')
      return
    }

    setMessage('ส่งคำขอเรียบร้อยแล้ว!')
    setName('')
    setDeviceType('')
    setDeviceModel('')
    setIssue('')
    setAddress('')
  }

  return (
    <div className="form-page">
      <div className="form-card">
        <h2 className="form-title">แบบฟอร์มแจ้งซ่อม</h2>
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label className="form-label">ชื่อ</label>
            <input
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ชื่อ"
            />
          </div>

          <div className="form-group">
            <label className="form-label">ประเภทอุปกรณ์</label>
            <input
              className="form-input"
              value={deviceType}
              onChange={(e) => setDeviceType(e.target.value)}
              placeholder="เช่น โน้ตบุ๊ก"
            />
          </div>

          <div className="form-group">
            <label className="form-label">ชื่อรุ่น</label>
            <input
              className="form-input"
              value={deviceModel}
              onChange={(e) => setDeviceModel(e.target.value)}
              placeholder="เช่น Acer Nitro 5"
            />
          </div>

          <div className="form-group">
            <label className="form-label">ระบุเหตุ</label>
            <textarea
              className="form-textarea"
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              placeholder="อาการ / ปัญหา"
              rows={4}
            />
          </div>

          <div className="form-group">
            <label className="form-label">ที่อยู่</label>
            <textarea
              className="form-textarea"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="ที่อยู่สำหรับรับซ่อม"
              rows={3}
            />
          </div>

          {message && (
            <div className={`form-message ${message.includes('เรียบร้อย') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <button type="submit" disabled={loading} className="form-submit">
            {loading ? 'กำลังส่ง...' : 'ส่งคำขอแจ้งซ่อม'}
          </button>
        </form>
      </div>
    </div>
  )
}

