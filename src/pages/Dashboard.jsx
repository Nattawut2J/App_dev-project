import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/auth.jsx'

export default function Dashboard() {
 const { user } = useAuth()
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0
  })
  const [recentRequests, setRecentRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchDashboardData = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      // Fetch all user's repair requests
      const { data: requests, error } = await supabase
        .from('repair_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching dashboard data:', error)
        setError('ไม่สามารถโหลดข้อมูล dashboard ได้')
        setLoading(false)
        return
      }

      const safeRequests = requests || []

      // Calculate statistics
      const total = safeRequests.length
      const pending = safeRequests.filter((r) => r.status === 'pending').length
      const inProgress = safeRequests.filter((r) => r.status === 'in_progress').length
      const completed = safeRequests.filter((r) => r.status === 'completed').length
      const cancelled = safeRequests.filter((r) => r.status === 'cancelled').length

      setStats({
        total,
        pending,
        inProgress,
        completed,
        cancelled
      })

      setRecentRequests(safeRequests.slice(0, 5))
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    setLoading(true)
    setError('')
    fetchDashboardData()
  }, [fetchDashboardData])

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffa726'
      case 'in_progress': return '#42a5f5'
      case 'completed': return '#66bb6a'
      case 'cancelled': return '#ef5350'
      default: return '#9e9e9e'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'รอดำเนินการ'
      case 'in_progress': return 'กำลังดำเนินการ'
      case 'completed': return 'เสร็จสิ้น'
      case 'cancelled': return 'ยกเลิก'
      default: return status
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div>กำลังโหลดข้อมูล...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#c0392b' }}>
        <h2>เกิดข้อผิดพลาด</h2>
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ marginBottom: '30px', color: '#333' }}>แดชบอร์ด</h1>

      {/* Statistics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', opacity: 0.9 }}>ทั้งหมด</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats.total}</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #ffa726 0%, #fb8c00 100%)',
          color: 'white',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', opacity: 0.9 }}>รอดำเนินการ</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats.pending}</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #42a5f5 0%, #1976d2 100%)',
          color: 'white',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', opacity: 0.9 }}>กำลังดำเนินการ</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats.inProgress}</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #66bb6a 0%, #388e3c 100%)',
          color: 'white',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', opacity: 0.9 }}>เสร็จสิ้น</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats.completed}</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #ef5350 0%, #c62828 100%)',
          color: 'white',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', opacity: 0.9 }}>ยกเลิก</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats.cancelled}</div>
        </div>
      </div>

      {/* Recent Requests */}
      <div style={{
        background: 'white',
        borderRadius: '10px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #eee',
          background: '#f8f9fa'
        }}>
          <h2 style={{ margin: 0, color: '#333' }}>การแจ้งซ่อมล่าสุด</h2>
        </div>

        <div style={{ padding: '0' }}>
          {recentRequests.length === 0 ? (
            <div style={{
              padding: '40px',
              textAlign: 'center',
              color: '#666'
            }}>
              ยังไม่มีรายการแจ้งซ่อม
            </div>
          ) : (
            <div>
              {recentRequests.map((request, index) => (
                <div
                  key={request.id}
                  style={{
                    padding: '15px 20px',
                    borderBottom: index < recentRequests.length - 1 ? '1px solid #eee' : 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                      {request.device_name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {new Date(request.created_at).toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  <div style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '500',
                    backgroundColor: getStatusColor(request.status),
                    color: 'white'
                  }}>
                    {getStatusText(request.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}