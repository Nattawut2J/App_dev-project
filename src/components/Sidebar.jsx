import { Link, useLocation } from 'react-router-dom'
import { FaTachometerAlt, FaTools, FaHistory, FaUser, FaUserShield, FaWrench } from 'react-icons/fa'
import { useAuth } from '../lib/auth.jsx'

export default function Sidebar({ isOpen, toggleSidebar }) {
  const location = useLocation()
  const { userRole } = useAuth()

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: FaTachometerAlt },
    { path: '/repair-form', label: 'แจ้งซ่อม', icon: FaTools },
    { path: '/history', label: 'ประวัติแจ้งซ่อม', icon: FaHistory },
    { path: '/profile', label: 'Profile', icon: FaUser },
    ...(userRole === 'technician' || userRole === 'admin'
      ? [{ path: '/technician', label: 'งานของฉัน', icon: FaWrench }]
      : []),
    ...(userRole === 'admin'
      ? [{ path: '/admin', label: 'ผู้ดูแลระบบ', icon: FaUserShield }]
      : []),
  ]

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={toggleSidebar}
        />
      )}

      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>ระบบแจ้งซ่อม</h2>
          <button className="sidebar-close" onClick={toggleSidebar}>
            ✕
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => {
                  // Close sidebar on mobile after navigation
                  if (window.innerWidth <= 768) {
                    toggleSidebar()
                  }
                }}
              >
                <Icon className="sidebar-icon" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </>
  )
}
