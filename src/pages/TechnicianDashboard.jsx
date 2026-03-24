import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/auth.jsx'

const STATUS_COLORS = {
  pending: '#ffa726',
  in_progress: '#42a5f5',
  completed: '#66bb6a',
  cancelled: '#ef5350',
}

const STATUS_LABELS = {
  pending: 'รอดำเนินการ',
  in_progress: 'กำลังดำเนินการ',
  completed: 'เสร็จสิ้น',
  cancelled: 'ยกเลิก',
}

export default function TechnicianDashboard() {
  const { user } = useAuth()
  const [assignments, setAssignments] = useState([])
  const [stats, setStats] = useState({ total: 0, inProgress: 0, completed: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const calcStats = (list) => ({
    total: list.length,
    inProgress: list.filter((r) => r.status === 'in_progress').length,
    completed: list.filter((r) => r.status === 'completed').length,
  })

  const fetchAssignments = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('repair_requests')
        .select('*')
        .eq('assigned_to', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      const safe = data || []
      setAssignments(safe)
      setStats(calcStats(safe))
    } catch (err) {
      console.error(err)
      setError('ไม่สามารถโหลดข้อมูลงานได้')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchAssignments()
  }, [fetchAssignments])

  const updateStatus = async (requestId, newStatus) => {
    const { error } = await supabase
      .from('repair_requests')
      .update({ status: newStatus })
      .eq('id', requestId)

    if (!error) {
      const updated = assignments.map((r) => (r.id === requestId ? { ...r, status: newStatus } : r))
      setAssignments(updated)
      setStats(calcStats(updated))
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
        <button
          onClick={fetchAssignments}
          style={{
            padding: '8px 20px',
            background: '#42a5f5',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          ลองอีกครั้ง
        </button>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ marginBottom: '4px', color: '#333' }}>หน้าช่างเทคนิค</h1>
      <p style={{ color: '#666', marginBottom: '24px' }}>รายการงานซ่อมที่ได้รับมอบหมาย</p>

      {/* Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          marginBottom: '30px',
        }}
      >
        {[
          {
            label: 'งานที่ได้รับมอบหมาย',
            value: stats.total,
            gradient: 'linear-gradient(135deg, #667eea, #764ba2)',
          },
          {
            label: 'กำลังซ่อม',
            value: stats.inProgress,
            gradient: 'linear-gradient(135deg, #42a5f5, #1976d2)',
          },
          {
            label: 'ซ่อมเสร็จแล้ว',
            value: stats.completed,
            gradient: 'linear-gradient(135deg, #66bb6a, #388e3c)',
          },
        ].map((card) => (
          <div
            key={card.label}
            style={{
              background: card.gradient,
              color: 'white',
              padding: '20px',
              borderRadius: '10px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            }}
          >
            <h3 style={{ margin: '0 0 10px', fontSize: '14px', opacity: 0.9 }}>{card.label}</h3>
            <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* Assignments list */}
      <div
        style={{
          background: 'white',
          borderRadius: '10px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #eee',
            background: '#f8f9fa',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '16px', color: '#333' }}>รายการงานทั้งหมด</h2>
        </div>

        {assignments.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            ยังไม่มีงานที่ได้รับมอบหมาย
          </div>
        ) : (
          assignments.map((req, idx) => (
            <div
              key={req.id}
              style={{
                padding: '18px 20px',
                borderBottom: idx < assignments.length - 1 ? '1px solid #eee' : 'none',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                {/* Info */}
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ fontWeight: '600', fontSize: '15px', marginBottom: '4px' }}>
                    {req.device_name}
                  </div>
                  {req.problem_description && (
                    <div style={{ fontSize: '13px', color: '#555', marginBottom: '6px' }}>
                      {req.problem_description}
                    </div>
                  )}
                  <div style={{ fontSize: '12px', color: '#999' }}>
                    {new Date(req.created_at).toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>

                {/* Status + Actions */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    flexWrap: 'wrap',
                  }}
                >
                  <span
                    style={{
                      padding: '5px 14px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '500',
                      backgroundColor: STATUS_COLORS[req.status] || '#9e9e9e',
                      color: 'white',
                    }}
                  >
                    {STATUS_LABELS[req.status] || req.status}
                  </span>

                  {req.status === 'pending' && (
                    <button
                      onClick={() => updateStatus(req.id, 'in_progress')}
                      style={{
                        padding: '6px 16px',
                        borderRadius: '6px',
                        border: 'none',
                        background: '#42a5f5',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '500',
                      }}
                    >
                      เริ่มซ่อม
                    </button>
                  )}

                  {req.status === 'in_progress' && (
                    <button
                      onClick={() => updateStatus(req.id, 'completed')}
                      style={{
                        padding: '6px 16px',
                        borderRadius: '6px',
                        border: 'none',
                        background: '#66bb6a',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '500',
                      }}
                    >
                      ซ่อมเสร็จแล้ว
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
