import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/auth.jsx'
import { Pie } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

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

const ROLE_LABELS = {
  user: 'ผู้ใช้ทั่วไป',
  technician: 'ช่างเทคนิค',
  admin: 'ผู้ดูแลระบบ',
  pending: 'รอการอนุมัติ',
}

const roleColor = (role) => {
  switch (role) {
    case 'admin': return '#764ba2'
    case 'technician': return '#1976d2'
    case 'pending': return '#ff7043'
    default: return '#66bb6a'
  }
}

const thStyle = {
  padding: '12px 16px',
  textAlign: 'left',
  fontWeight: '600',
  fontSize: '13px',
  color: '#555',
  borderBottom: '1px solid #eee',
  whiteSpace: 'nowrap',
}

const tdStyle = {
  padding: '12px 16px',
  fontSize: '14px',
  color: '#333',
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, completed: 0, cancelled: 0 })
  const [allRequests, setAllRequests] = useState([])
  const [profiles, setProfiles] = useState([])
  const [technicians, setTechnicians] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [{ data: requests, error: reqErr }, { data: profileData }] = await Promise.all([
        supabase.from('repair_requests').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      ])

      if (reqErr) throw reqErr

      const reqs = requests || []
      setAllRequests(reqs)
      setStats({
        total: reqs.length,
        pending: reqs.filter((r) => r.status === 'pending').length,
        inProgress: reqs.filter((r) => r.status === 'in_progress').length,
        completed: reqs.filter((r) => r.status === 'completed').length,
        cancelled: reqs.filter((r) => r.status === 'cancelled').length,
      })

      const profs = profileData || []
      setProfiles(profs)
      setTechnicians(profs.filter((p) => p.role === 'technician'))
    } catch (err) {
      console.error(err)
      setError('ไม่สามารถโหลดข้อมูลได้')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const updateUserRole = async (profileId, newRole) => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', profileId)
    if (!error) {
      const updated = profiles.map((p) => (p.id === profileId ? { ...p, role: newRole } : p))
      setProfiles(updated)
      setTechnicians(updated.filter((p) => p.role === 'technician'))
    }
  }

  const updateRequestStatus = async (requestId, newStatus) => {
    const { error } = await supabase
      .from('repair_requests')
      .update({ status: newStatus })
      .eq('id', requestId)
    if (!error) {
      const updated = allRequests.map((r) => (r.id === requestId ? { ...r, status: newStatus } : r))
      setAllRequests(updated)
      setStats({
        total: updated.length,
        pending: updated.filter((r) => r.status === 'pending').length,
        inProgress: updated.filter((r) => r.status === 'in_progress').length,
        completed: updated.filter((r) => r.status === 'completed').length,
        cancelled: updated.filter((r) => r.status === 'cancelled').length,
      })
    }
  }

  const assignTechnician = async (requestId, technicianId) => {
    const { error } = await supabase
      .from('repair_requests')
      .update({ assigned_to: technicianId || null })
      .eq('id', requestId)
    if (!error) {
      setAllRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, assigned_to: technicianId || null } : r)),
      )
    }
  }

  const tabStyle = (tab) => ({
    padding: '10px 24px',
    border: 'none',
    borderBottom: activeTab === tab ? '3px solid #667eea' : '3px solid transparent',
    background: 'none',
    color: activeTab === tab ? '#667eea' : '#666',
    fontWeight: activeTab === tab ? '600' : '400',
    cursor: 'pointer',
    fontSize: '14px',
  })

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
          onClick={fetchData}
          style={{ padding: '8px 20px', background: '#667eea', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          ลองอีกครั้ง
        </button>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ marginBottom: '4px', color: '#333' }}>หน้าผู้ดูแลระบบ</h1>
      <p style={{ color: '#666', marginBottom: '24px' }}>จัดการผู้ใช้ รายการแจ้งซ่อม และภาพรวมระบบทั้งหมด</p>

      {/* Tab Navigation */}
      <div style={{ borderBottom: '1px solid #eee', marginBottom: '30px', display: 'flex', gap: '4px' }}>
        <button style={tabStyle('overview')} onClick={() => setActiveTab('overview')}>
          แดชบอร์ด
        </button>
        <button style={tabStyle('users')} onClick={() => setActiveTab('users')}>
          จัดการผู้ใช้ ({profiles.length})
        </button>
        <button style={tabStyle('requests')} onClick={() => setActiveTab('requests')}>
          รายการแจ้งซ่อม ({allRequests.length})
        </button>
      </div>

      {/* ── Overview Tab ── */}
      {activeTab === 'overview' && (
        <div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '24px',
              marginBottom: '30px',
            }}
          >
            {/* Pie Chart */}
            <div
              style={{
                background: 'white',
                padding: '20px',
                borderRadius: '10px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#444' }}>
                ภาพรวมสถานะการแจ้งซ่อม
              </h3>
              <div style={{ width: '100%', maxWidth: '280px' }}>
                <Pie
                  data={{
                    labels: ['รอดำเนินการ', 'กำลังดำเนินการ', 'เสร็จสิ้น', 'ยกเลิก'],
                    datasets: [
                      {
                        label: 'จำนวนรายการ',
                        data: [stats.pending, stats.inProgress, stats.completed, stats.cancelled],
                        backgroundColor: [
                          'rgba(255, 167, 38, 0.8)',
                          'rgba(66, 165, 245, 0.8)',
                          'rgba(102, 187, 106, 0.8)',
                          'rgba(239, 83, 80, 0.8)',
                        ],
                        borderColor: ['#ffa726', '#42a5f5', '#66bb6a', '#ef5350'],
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                    },
                  }}
                />
              </div>
            </div>

            {/* User stats */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                justifyContent: 'space-between',
              }}
            >
              {[
                { label: 'ผู้ใช้ทั้งหมด', value: profiles.length, gradient: 'linear-gradient(135deg, #26c6da, #0097a7)' },
                { label: 'ช่างเทคนิค', value: technicians.length, gradient: 'linear-gradient(135deg, #ab47bc, #7b1fa2)' },
                {
                  label: 'รอการอนุมัติ',
                  value: profiles.filter((p) => p.role === 'pending').length,
                  gradient: 'linear-gradient(135deg, #ff7043, #d84315)',
                },
              ].map((card) => (
                <div
                  key={card.label}
                  style={{
                    background: card.gradient,
                    color: 'white',
                    padding: '15px 20px',
                    borderRadius: '10px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <h3 style={{ margin: '0 0 8px', fontSize: '14px', opacity: 0.9 }}>{card.label}</h3>
                  <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{card.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Repair stats */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '16px',
              marginBottom: '24px',
            }}
          >
            {[
              { label: 'แจ้งซ่อมทั้งหมด', value: stats.total, gradient: 'linear-gradient(135deg, #667eea, #764ba2)' },
              { label: 'รอดำเนินการ', value: stats.pending, gradient: 'linear-gradient(135deg, #ffa726, #fb8c00)' },
              { label: 'กำลังดำเนินการ', value: stats.inProgress, gradient: 'linear-gradient(135deg, #42a5f5, #1976d2)' },
              { label: 'เสร็จสิ้น', value: stats.completed, gradient: 'linear-gradient(135deg, #66bb6a, #388e3c)' },
              { label: 'ยกเลิก', value: stats.cancelled, gradient: 'linear-gradient(135deg, #ef5350, #c62828)' },
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

          {/* Recent requests */}
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
              <h2 style={{ margin: 0, fontSize: '16px', color: '#333' }}>การแจ้งซ่อมล่าสุด (5 รายการ)</h2>
            </div>
            {allRequests.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>ยังไม่มีรายการแจ้งซ่อม</div>
            ) : (
              allRequests.slice(0, 5).map((req, i) => (
                <div
                  key={req.id}
                  style={{
                    padding: '14px 20px',
                    borderBottom: i < Math.min(4, allRequests.length - 1) ? '1px solid #eee' : 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '500', marginBottom: '4px' }}>{req.device_name}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {new Date(req.created_at).toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                  <span
                    style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '500',
                      backgroundColor: STATUS_COLORS[req.status] || '#9e9e9e',
                      color: 'white',
                    }}
                  >
                    {STATUS_LABELS[req.status] || req.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── Users Tab ── */}
      {activeTab === 'users' && (
        <div style={{ overflowX: 'auto' }}>
          <div
            style={{
              background: 'white',
              borderRadius: '10px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              overflow: 'hidden',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  <th style={thStyle}>ชื่อ</th>
                  <th style={thStyle}>อีเมล</th>
                  <th style={thStyle}>สิทธิ์ปัจจุบัน</th>
                  <th style={thStyle}>เปลี่ยนสิทธิ์</th>
                  <th style={thStyle}>วันที่สมัคร</th>
                </tr>
              </thead>
              <tbody>
                {profiles.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                      ไม่พบข้อมูลผู้ใช้
                    </td>
                  </tr>
                ) : (
                  profiles.map((profile) => (
                    <tr key={profile.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={tdStyle}>{profile.full_name || '-'}</td>
                      <td style={tdStyle}>{profile.email || '-'}</td>
                      <td style={tdStyle}>
                        <span
                          style={{
                            padding: '3px 10px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            background: roleColor(profile.role),
                            color: 'white',
                          }}
                        >
                          {ROLE_LABELS[profile.role] || profile.role}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        {profile.id !== user?.id ? (
                          <select
                            value={profile.role || 'user'}
                            onChange={(e) => updateUserRole(profile.id, e.target.value)}
                            style={{
                              padding: '5px 8px',
                              borderRadius: '6px',
                              border: '1px solid #ddd',
                              fontSize: '13px',
                              cursor: 'pointer',
                            }}
                          >
                            <option value="pending">รอการอนุมัติ</option>
                            <option value="user">ผู้ใช้ทั่วไป</option>
                            <option value="technician">ช่างเทคนิค</option>
                            <option value="admin">ผู้ดูแลระบบ</option>
                          </select>
                        ) : (
                          <span style={{ color: '#999', fontSize: '12px' }}>บัญชีของคุณ</span>
                        )}
                      </td>
                      <td style={tdStyle}>
                        {profile.created_at
                          ? new Date(profile.created_at).toLocaleDateString('th-TH')
                          : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Repair Requests Tab ── */}
      {activeTab === 'requests' && (
        <div style={{ overflowX: 'auto' }}>
          <div
            style={{
              background: 'white',
              borderRadius: '10px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              overflow: 'hidden',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '750px' }}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  <th style={thStyle}>อุปกรณ์</th>
                  <th style={thStyle}>ปัญหา</th>
                  <th style={thStyle}>สถานะ</th>
                  <th style={thStyle}>มอบหมายช่าง</th>
                  <th style={thStyle}>อัปเดตสถานะ</th>
                  <th style={thStyle}>วันที่แจ้ง</th>
                </tr>
              </thead>
              <tbody>
                {allRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                      ยังไม่มีรายการแจ้งซ่อม
                    </td>
                  </tr>
                ) : (
                  allRequests.map((req) => (
                    <tr key={req.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={tdStyle}>{req.device_name}</td>
                      <td
                        style={{
                          ...tdStyle,
                          maxWidth: '200px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        title={req.problem_description}
                      >
                        {req.problem_description || '-'}
                      </td>
                      <td style={tdStyle}>
                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            backgroundColor: STATUS_COLORS[req.status] || '#9e9e9e',
                            color: 'white',
                          }}
                        >
                          {STATUS_LABELS[req.status] || req.status}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <select
                          value={req.assigned_to || ''}
                          onChange={(e) => assignTechnician(req.id, e.target.value)}
                          style={{
                            padding: '5px 8px',
                            borderRadius: '6px',
                            border: '1px solid #ddd',
                            fontSize: '13px',
                            maxWidth: '160px',
                          }}
                        >
                          <option value="">ยังไม่มอบหมาย</option>
                          {technicians.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.full_name || t.email}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td style={tdStyle}>
                        <select
                          value={req.status}
                          onChange={(e) => updateRequestStatus(req.id, e.target.value)}
                          style={{
                            padding: '5px 8px',
                            borderRadius: '6px',
                            border: '1px solid #ddd',
                            fontSize: '13px',
                          }}
                        >
                          <option value="pending">รอดำเนินการ</option>
                          <option value="in_progress">กำลังดำเนินการ</option>
                          <option value="completed">เสร็จสิ้น</option>
                          <option value="cancelled">ยกเลิก</option>
                        </select>
                      </td>
                      <td style={tdStyle}>
                        {new Date(req.created_at).toLocaleDateString('th-TH')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
