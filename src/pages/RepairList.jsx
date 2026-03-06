import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function RepairList() {
  const [requests, setRequests] = useState([])
  const [deviceName, setDeviceName] = useState('')

  // READ: ดึงข้อมูล
  const fetchRequests = async () => {
    const { data } = await supabase.from('repair_requests').select('*').order('id', { ascending: false })
    setRequests(data)
  }

  useEffect(() => { fetchRequests() }, [])

  // CREATE: เพิ่มข้อมูล
  const addRequest = async () => {
    await supabase.from('repair_requests').insert([{ device_name: deviceName, status: 'pending' }])
    setDeviceName('')
    fetchRequests() // โหลดข้อมูลใหม่หลังเพิ่ม
  }

  // DELETE: ลบข้อมูล
  const deleteRequest = async (id) => {
    await supabase.from('repair_requests').delete().eq('id', id)
    fetchRequests()
  }

  return (
    <div style={{ padding: '20px' }}>
      <h3>รายการแจ้งซ่อม</h3>
      <input value={deviceName} onChange={(e) => setDeviceName(e.target.value)} placeholder="ชื่ออุปกรณ์ที่เสีย" />
      <button onClick={addRequest}>ส่งแจ้งซ่อม</button>

      <ul>
        {requests.map(item => (
          <li key={item.id}>
            {item.device_name} - สถานะ: {item.status} 
            <button onClick={() => deleteRequest(item.id)} style={{ marginLeft: '10px', color: 'red' }}>ลบ</button>
          </li>
        ))}
      </ul>
    </div>
  )
}