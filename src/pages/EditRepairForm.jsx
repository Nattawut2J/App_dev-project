import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'
import { supabase } from '../lib/supabaseClient'

export default function EditRepairForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [name, setName] = useState('')
  const [deviceType, setDeviceType] = useState('')
  const [deviceModel, setDeviceModel] = useState('')
  const [issue, setIssue] = useState('')
  const [address, setAddress] = useState('')
  const [status, setStatus] = useState('pending')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchRepairRequest()
  }, [id])

  const fetchRepairRequest = async () => {
    if (!id || !user?.id) return

    setLoading(true)
    const { data, error } = await supabase
      .from('repair_requests')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    setLoading(false)

    if (error || !data) {
      setMessage('ไม่พบรายการนี้')
      navigate('/history', { replace: true })
      return
    }

    // ถ้าสถานะไม่ใช่ pending ห้ามแก้ไข
    if (data.status !== 'pending') {
      setMessage('ไม่สามารถแก้ไขรายการนี้ได้ (สถานะไม่ใช่ "รอดำเนิน")')
      navigate('/history', { replace: true })
      return
    }

    setName(data.client_name)
    setDeviceType(data.device_type)
    setDeviceModel(data.device_model)
    setIssue(data.issue)
    setAddress(data.address)
    setStatus(data.status)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')

    if (!name || !deviceType || !deviceModel || !issue || !address) {
      setMessage('กรุณากรอกข้อมูลให้ครบทุกช่อง')
      return
    }

    setSaving(true)
    const { error } = await supabase
      .from('repair_requests')
      .update({
        client_name: name,
        device_type: deviceType,
        device_model: deviceModel,
        issue,
        address,
      })
      .eq('id', id)
      .eq('user_id', user.id)

    setSaving(false)

    if (error) {
      console.error('Update error:', error)
      setMessage('เกิดข้อผิดพลาดในการบันทึก กรุณาลองอีกครั้ง')
      return
    }

    setMessage('บันทึกการแก้ไขสำเร็จ!')
    setTimeout(() => {
      navigate('/history', { replace: true })
    }, 1500)
  }

  if (loading) {
    return <div className="loading">กำลังโหลดข้อมูล...</div>
  }

  return (
    <div className="form-page">
      <div className="form-card">
        <h2 className="form-title">แก้ไขแบบฟอร์มแจ้งซ่อม</h2>
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
            <div className={`form-message ${message.includes('สำเร็จ') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <div className="form-actions">
            <button type="submit" disabled={saving} className="form-submit">
              {saving ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/history', { replace: true })}
              className="form-cancel"
            >
              ยกเลิก
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
