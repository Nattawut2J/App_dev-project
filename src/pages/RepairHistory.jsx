import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'
import { supabase } from '../lib/supabaseClient'

export default function RepairHistory() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchRepairHistory()
  }, [user])

  const fetchRepairHistory = async () => {
    if (!user?.id) return

    setLoading(true)
    setError('')

    const { data, error } = await supabase
      .from('repair_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    setLoading(false)

    if (error) {
      console.error('Fetch error:', error)
      setError('ไม่สามารถโหลดข้อมูล กรุณาลองอีกครั้ง')
      return
    }

    setRequests(data || [])
  }

  const deleteRequest = async (id) => {
    if (!window.confirm('คุณต้องการลบรายการนี้หรือไม่?')) return

    const { error, data } = await supabase.from('repair_requests').delete().eq('id', id).select()

    if (error) {
      console.error('Delete error:', error)
      alert('เกิดข้อผิดพลาดในการลบรายการ')
      return
    }

    if (data.length === 0) {
      alert('ไม่สามารถลบรายการได้ (อาจเกิดจากปัญหาเรื่องสิทธิ์การเข้าถึง หรือรายการถูกลบไปแล้ว)')
      return
    }

    setRequests(requests.filter((r) => r.id !== id))
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { label: 'รอดำเนิน', color: '#f39c12' },
      accepted: { label: 'รับซ่อม', color: '#3498db' },
      completed: { label: 'ซ่อมเสร็จ', color: '#27ae60' },
      delivered: { label: 'ส่งมอบแล้ว', color: '#2ecc71' },
    }

    const style = statusMap[status] || statusMap.pending
    return (
      <span
        style={{
          background: style.color,
          color: 'white',
          padding: '4px 12px',
          borderRadius: '12px',
          fontSize: '0.9rem',
          fontWeight: '600',
        }}
      >
        {style.label}
      </span>
    )
  }

  return (
    <div className="history-page">
      <h2 className="history-title">ประวัติการแจ้งซ่อม</h2>

      {loading && <div className="loading">กำลังโหลดข้อมูล...</div>}

      {error && <div className="error-message">{error}</div>}

      {!loading && requests.length === 0 && (
        <div className="empty-state">
          <p>ไม่มีรายการแจ้งซ่อม</p>
        </div>
      )}

      {!loading && requests.length > 0 && (
        <div className="table-container">
          <table className="history-table">
            <thead>
              <tr>
                <th>ลำดับ</th>
                <th>อุปกรณ์</th>
                <th>ปัญหา</th>
                <th>สถานะ</th>
                <th>วันที่</th>
                <th>แอคชั่น</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request, index) => (
                <tr key={request.id}>
                  <td>{index + 1}</td>
                  <td>{request.device_name}</td>
                  <td>{request.problem_description?.substring(0, 30) || ''}...</td>
                  <td>{getStatusBadge(request.status)}</td>
                  <td>{new Date(request.created_at).toLocaleDateString('th-TH')}</td>
                  <td>
                    <div className="action-buttons">
                      {request.status === 'pending' && (
                        <button
                          className="btn-edit"
                          onClick={() => navigate(`/repair-form/edit/${request.id}`)}
                        >
                          แก้ไข
                        </button>
                      )}
                      {request.status !== 'pending' && (
                        <button className="btn-edit-disabled" disabled title="ไม่สามารถแก้ไขได้">
                          แก้ไข
                        </button>
                      )}
                       {request.status === 'pending' ? (
                        <button className="btn-delete" onClick={() => deleteRequest(request.id)}>
                          ลบ
                        </button>
                      ) : (
                        <button className="btn-delete-disabled" disabled title="ไม่สามารถลบได้">
                          ลบ
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
